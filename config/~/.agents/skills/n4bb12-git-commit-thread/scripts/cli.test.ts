import { afterEach, describe, expect, test } from "bun:test"
import { dirname, join } from "node:path"
import { $ } from "bun"

import { CommitMyError, run } from "./cli"

type Repo = {
  root: string
  repo: string
}

const repos: string[] = []

afterEach(async () => {
  for (const root of repos.splice(0)) {
    const repo = join(root, "repo")

    try {
      const porcelain = await git(repo, ["worktree", "list", "--porcelain"])

      for (const line of porcelain.split("\n")) {
        if (!line.startsWith("worktree ")) {
          continue
        }

        const worktree = line.slice("worktree ".length)

        if (worktree === repo) {
          continue
        }

        await git(repo, ["worktree", "remove", "--force", worktree]).catch(() => undefined)
        await rm(dirname(worktree), { recursive: true, force: true }).catch(() => undefined)
      }
    } catch {
      // The repo may already be gone.
    }

    await rm(root, { recursive: true, force: true })
  }
})

describe("commit-my", () => {
  test("copies dirty files into a sandbox and leaves the shared tree unchanged", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "mine\n")
    await rm(join(repo, "keep-me.txt"))
    await writeFile(join(repo, "new-file.txt"), "untracked\n")
    await mkdir(join(repo, "node_modules"), { recursive: true })
    await writeFile(join(repo, "node_modules/pkg.js"), "ignored\n")
    await writeFile(join(repo, ".env.local"), "SECRET=1\n")
    await writeFile(join(repo, "other.js"), "theirs\n")

    await git(repo, ["add", "keep-me.txt"])
    const stagedBefore = await git(repo, ["diff", "--cached"])
    const statusBefore = await git(repo, ["status", "--short"])
    const appBefore = await readFile(join(repo, "app.js"), "utf8")

    const started = await startSandbox(repo)
    const sandboxStatus = await git(started.sandbox, ["status", "--short"])

    expect(sandboxStatus).toContain("M app.js")
    expect(sandboxStatus).toContain("D keep-me.txt")
    expect(sandboxStatus).toContain("?? new-file.txt")
    expect(sandboxStatus).toContain("M other.js")
    expect(sandboxStatus).not.toContain(".env.local")
    expect(await pathExists(join(started.sandbox, ".env.local"))).toBe(false)
    expect(await git(repo, ["ls-tree", "-r", "--name-only", started.snapshotTree])).not.toContain("node_modules")
    expect(await git(repo, ["ls-tree", "-r", "--name-only", started.snapshotTree])).not.toContain(".env.local")
    expect((await $`test -L ${join(started.sandbox, "node_modules")}`.nothrow().quiet()).exitCode).toBe(0)
    expect(await git(repo, ["status", "--short"])).toBe(statusBefore)
    expect(await git(repo, ["diff", "--cached"])).toBe(stagedBefore)
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe(appBefore)
    expect(await pathExists(join(repo, "new-file.txt"))).toBe(true)
    expect(await pathExists(join(repo, "keep-me.txt"))).toBe(false)

    await run(["abort"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
  })

  test("isolate drops unstaged files so hooks only see the commit candidate", async () => {
    const { repo } = await createRepo()
    const hook = join(repo, ".git/hooks/pre-commit")

    await writeFile(
      hook,
      `#!/bin/sh
if grep -q THEIRS_BROKEN other.js 2>/dev/null; then
  echo "HOOK_SAW_OTHER_AGENT" >&2
  exit 1
fi
`,
    )
    await chmod(hook, 0o755)

    await writeFile(join(repo, "app.js"), "mine\n")
    await writeFile(join(repo, "other.js"), "THEIRS_BROKEN\n")

    const started = await startSandbox(repo)

    await git(started.sandbox, ["add", "app.js"])
    await run(["isolate"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })

    const isolated = await git(started.sandbox, ["status", "--short"])

    expect(isolated).toBe("M  app.js")
    expect(await readFile(join(started.sandbox, "other.js"), "utf8")).toBe("base\n")
    expect(await readFile(join(repo, "other.js"), "utf8")).toBe("THEIRS_BROKEN\n")

    await git(started.sandbox, ["commit", "-m", "mine"])
    await run(["finish"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })

    expect(await git(repo, ["log", "-1", "--pretty=%s"])).toBe("mine")
    expect(await git(repo, ["show", "HEAD:app.js"])).toBe("mine")
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe("mine\n")
    expect(await readFile(join(repo, "other.js"), "utf8")).toBe("THEIRS_BROKEN\n")
    expect(await git(repo, ["status", "--short"])).toBe(" M other.js")
  })

  test("refresh restores remaining snapshot files after an atomic commit", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "A\n")
    await writeFile(join(repo, "other.js"), "B\n")

    const started = await startSandbox(repo)

    await git(started.sandbox, ["add", "app.js"])
    await run(["isolate"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    await git(started.sandbox, ["commit", "-m", "A"])
    await run(["refresh"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })

    expect(await git(started.sandbox, ["status", "--short"])).toBe(" M other.js")
    expect(await readFile(join(started.sandbox, "app.js"), "utf8")).toBe("A\n")
    expect(await readFile(join(started.sandbox, "other.js"), "utf8")).toBe("B\n")

    await git(started.sandbox, ["add", "other.js"])
    await run(["isolate"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    await git(started.sandbox, ["commit", "-m", "B"])
    await run(["finish"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })

    expect(await git(repo, ["log", "--pretty=%s"])).toBe("B\nA\ninit")
  })

  test("finish rebases onto a moved branch without changing shared files", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "mine\n")
    await writeFile(join(repo, "other.js"), "theirs\n")

    const started = await startSandbox(repo)

    await git(started.sandbox, ["add", "app.js"])
    await run(["isolate"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    await git(started.sandbox, ["commit", "-m", "mine"])

    await writeFile(join(repo, "extra.txt"), "landed\n")
    await git(repo, ["add", "extra.txt"])
    await git(repo, ["commit", "-m", "landed"])
    await writeFile(join(repo, "app.js"), "mine\n")
    await writeFile(join(repo, "other.js"), "theirs\n")

    const sharedBefore = await snapshotFiles(repo)

    await run(["finish"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })

    expect(await git(repo, ["log", "--pretty=%s"])).toBe("mine\nlanded\ninit")
    expect(await snapshotFiles(repo)).toEqual(sharedBefore)
    expect(await git(repo, ["status", "--short"])).toBe(" M other.js")
  })

  test("finish leaves a conflicted sandbox when replay is not conflict-free", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "mine\n")

    const started = await startSandbox(repo)

    await git(started.sandbox, ["add", "app.js"])
    await run(["isolate"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    await git(started.sandbox, ["commit", "-m", "mine"])

    await writeFile(join(repo, "app.js"), "theirs\n")
    await git(repo, ["add", "app.js"])
    await git(repo, ["commit", "-m", "theirs"])
    await writeFile(join(repo, "app.js"), "mine\n")

    const beforeHead = await git(repo, ["rev-parse", "HEAD"])

    let failed: unknown

    try {
      await run(["finish"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    } catch (error) {
      failed = error
    }

    expect(failed).toBeInstanceOf(CommitMyError)
    expect(String(failed)).toContain("Rebase conflict")
    expect(await git(repo, ["rev-parse", "HEAD"])).toBe(beforeHead)
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe("mine\n")
    expect(await git(started.sandbox, ["status", "--short"])).toContain("UU app.js")

    await run(["abort"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    expect(await git(repo, ["worktree", "list"])).not.toContain(started.sandbox)
  })

  test("abort removes the sandbox and does not move the branch", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "mine\n")

    const started = await startSandbox(repo)
    const head = await git(repo, ["rev-parse", "HEAD"])

    await git(started.sandbox, ["add", "app.js"])
    await run(["isolate"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })
    await git(started.sandbox, ["commit", "-m", "mine"])
    await run(["abort"], { cwd: started.sandbox, log: () => undefined, warn: () => undefined })

    expect(await git(repo, ["rev-parse", "HEAD"])).toBe(head)
    expect(await git(repo, ["log", "-1", "--pretty=%s"])).toBe("init")
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe("mine\n")
    expect(await git(repo, ["worktree", "list"])).not.toContain(started.sandbox)
  })

  test("one command commits only the given paths and leaves other dirty files", async () => {
    const { repo } = await createRepo()
    const hook = join(repo, ".git/hooks/pre-commit")

    await writeFile(
      hook,
      `#!/bin/sh
if grep -q THEIRS_BROKEN other.js 2>/dev/null; then
  echo "HOOK_SAW_OTHER_AGENT" >&2
  exit 1
fi
`,
    )
    await chmod(hook, 0o755)

    await writeFile(join(repo, "app.js"), "mine\n")
    await writeFile(join(repo, "other.js"), "THEIRS_BROKEN\n")

    await run(["-m", "mine", "--", "app.js"], { cwd: repo, log: () => undefined, warn: () => undefined })

    expect(await git(repo, ["log", "-1", "--pretty=%s"])).toBe("mine")
    expect(await git(repo, ["show", "HEAD:app.js"])).toBe("mine")
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe("mine\n")
    expect(await readFile(join(repo, "other.js"), "utf8")).toBe("THEIRS_BROKEN\n")
    expect(await git(repo, ["status", "--short"])).toBe(" M other.js")
    expect(await worktreeCount(repo)).toBe(1)
  })

  test("review prints every dirty change in the shared tree", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "mine\n")
    await writeFile(join(repo, "other.js"), "theirs\n")
    await writeFile(join(repo, "new-file.txt"), "untracked\n")

    const logs: string[] = []

    await run([], { cwd: repo, log: (message) => logs.push(message), warn: () => undefined })

    const output = logs.join("\n")

    expect(output).toContain("app.js")
    expect(output).toContain("other.js")
    expect(output).toContain("new-file.txt")
    expect(output).toContain("mine")
    expect(output).toContain("theirs")
    expect(output).toContain("untracked")
    expect(await git(repo, ["status", "--short"])).toContain("?? new-file.txt")
  })

  test("commits selected hunks from a mixed file and leaves the other hunks dirty", async () => {
    const { repo, root } = await createRepo()

    await writeFile(join(repo, "app.js"), "alpha\nbravo\ncharlie\ndelta\necho\nfoxtrot\n")
    await git(repo, ["add", "app.js"])
    await git(repo, ["commit", "-m", "lines"])
    await writeFile(join(repo, "app.js"), "alpha\nBRAVO\ncharlie\ndelta\nECHO\nfoxtrot\n")
    await writeFile(join(repo, "other.js"), "theirs\n")

    const patch = join(root, "mine.diff")

    await writeFile(
      patch,
      `diff --git a/app.js b/app.js
--- a/app.js
+++ b/app.js
@@ -1,4 +1,4 @@
 alpha
-bravo
+BRAVO
 charlie
 delta
`,
    )

    await run(["-m", "mine", "--patch", patch], { cwd: repo, log: () => undefined, warn: () => undefined })

    expect(await git(repo, ["log", "-1", "--pretty=%s"])).toBe("mine")
    expect(await git(repo, ["show", "HEAD:app.js"])).toBe("alpha\nBRAVO\ncharlie\ndelta\necho\nfoxtrot")
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe("alpha\nBRAVO\ncharlie\ndelta\nECHO\nfoxtrot\n")
    expect(await readFile(join(repo, "other.js"), "utf8")).toBe("theirs\n")
    expect(await git(repo, ["status", "--short"])).toBe(" M app.js\n M other.js")
    expect(await worktreeCount(repo)).toBe(1)
  })

  test("bun install registers commit hooks from package scripts", async () => {
    const { repo } = await createRepo()

    await writeFile(
      join(repo, "package.json"),
      `${JSON.stringify(
        {
          name: "commit-my-test",
          private: true,
          scripts: {
            prepare: "sh prepare-hooks.sh",
          },
        },
        null,
        2,
      )}\n`,
    )
    await writeFile(
      join(repo, "prepare-hooks.sh"),
      `#!/bin/sh
set -e
dir=$(git rev-parse --git-path hooks)
mkdir -p "$dir"
cat > "$dir/pre-commit" <<'HOOK'
#!/bin/sh
if grep -q THEIRS_BROKEN other.js 2>/dev/null; then
  echo "HOOK_SAW_OTHER_AGENT" >&2
  exit 1
fi
touch "$(git rev-parse --git-common-dir)/COMMIT_MY_HOOK_RAN"
HOOK
chmod +x "$dir/pre-commit"
`,
    )
    await git(repo, ["add", "package.json", "prepare-hooks.sh"])
    await git(repo, ["commit", "-m", "hooks"])

    await writeFile(join(repo, "app.js"), "mine\n")
    await writeFile(join(repo, "other.js"), "THEIRS_BROKEN\n")

    await run(["-m", "mine", "--", "app.js"], { cwd: repo, log: () => undefined, warn: () => undefined })

    expect(await pathExists(join(repo, ".git/COMMIT_MY_HOOK_RAN"))).toBe(true)
    expect(await git(repo, ["log", "-1", "--pretty=%s"])).toBe("mine")
    expect(await readFile(join(repo, "other.js"), "utf8")).toBe("THEIRS_BROKEN\n")
  })

  test("refuses to stage the whole repository", async () => {
    const { repo } = await createRepo()

    await writeFile(join(repo, "app.js"), "mine\n")

    let failed: unknown

    try {
      await run(["-m", "mine", "--", "."], { cwd: repo, log: () => undefined, warn: () => undefined })
    } catch (error) {
      failed = error
    }

    expect(failed).toBeInstanceOf(CommitMyError)
    expect(String(failed)).toContain("Refusing to stage")
    expect(await git(repo, ["log", "-1", "--pretty=%s"])).toBe("init")
  })

  test("commit failure removes the sandbox and does not move the branch", async () => {
    const { repo } = await createRepo()
    const hook = join(repo, ".git/hooks/pre-commit")

    await writeFile(hook, "#!/bin/sh\necho HOOK_FAILED >&2\nexit 1\n")
    await chmod(hook, 0o755)
    await writeFile(join(repo, "app.js"), "mine\n")

    const head = await git(repo, ["rev-parse", "HEAD"])
    let failed: unknown

    try {
      await run(["-m", "mine", "--", "app.js"], { cwd: repo, log: () => undefined, warn: () => undefined })
    } catch (error) {
      failed = error
    }

    expect(failed).toBeInstanceOf(CommitMyError)
    expect(String(failed)).toContain("HOOK_FAILED")
    expect(await git(repo, ["rev-parse", "HEAD"])).toBe(head)
    expect(await readFile(join(repo, "app.js"), "utf8")).toBe("mine\n")
    expect(await worktreeCount(repo)).toBe(1)
  })

  test("start refuses a detached shared HEAD", async () => {
    const { repo } = await createRepo()

    await git(repo, ["checkout", "--detach", "HEAD"])

    let failed: unknown

    try {
      await startSandbox(repo)
    } catch (error) {
      failed = error
    }

    expect(failed).toBeInstanceOf(CommitMyError)
    expect(String(failed)).toContain("detached HEAD")
  })
})

async function createRepo() {
  const root = await mkdtemp("commit-my-test-")
  const repo = join(root, "repo")

  repos.push(root)
  await mkdir(repo)
  await git(repo, ["init", "-b", "main"])
  await git(repo, ["config", "user.email", "test@example.com"])
  await git(repo, ["config", "user.name", "Test"])
  await git(repo, ["config", "commit.gpgsign", "false"])
  await writeFile(join(repo, ".gitignore"), "node_modules/\n.env.local\n")
  await writeFile(join(repo, "app.js"), "base\n")
  await writeFile(join(repo, "keep-me.txt"), "keep\n")
  await writeFile(join(repo, "other.js"), "base\n")
  await git(repo, ["add", "."])
  await git(repo, ["commit", "-m", "init"])

  return { root, repo } satisfies Repo
}

async function startSandbox(repo: string) {
  const logs: string[] = []

  await run(["start", "--json"], {
    cwd: repo,
    log: (message) => logs.push(message),
    warn: () => undefined,
  })

  return JSON.parse(logs.join("\n")) as {
    sandbox: string
    branch: string
    head: string
    snapshotTree: string
  }
}

async function snapshotFiles(repo: string) {
  return {
    app: await readFile(join(repo, "app.js"), "utf8"),
    other: await readFile(join(repo, "other.js"), "utf8"),
    extra: await readFile(join(repo, "extra.txt"), "utf8"),
  }
}

async function pathExists(path: string) {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0
}

async function writeFile(path: string, content: string) {
  await Bun.write(path, content)
}

async function readFile(path: string, _encoding?: string) {
  return Bun.file(path).text()
}

async function mkdir(path: string, _opts?: { recursive?: boolean }) {
  await $`mkdir -p ${path}`.quiet()
}

async function rm(path: string, _opts?: { recursive?: boolean; force?: boolean }) {
  await $`rm -rf ${path}`.nothrow().quiet()
}

async function chmod(path: string, _mode?: number) {
  await $`chmod 755 ${path}`.quiet()
}

async function mkdtemp(prefix: string) {
  return (await $`mktemp -d ${join(Bun.env.TMPDIR || "/tmp", `${prefix}XXXXXX`)}`.quiet().text()).trim()
}

async function worktreeCount(repo: string) {
  const porcelain = await git(repo, ["worktree", "list", "--porcelain"])

  return porcelain.split("\n").filter((line) => line.startsWith("worktree ")).length
}

async function git(cwd: string, args: string[]) {
  const proc = Bun.spawn(["git", "-C", cwd, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  if (code !== 0) {
    throw new Error(stderr || stdout || `git ${args.join(" ")} failed`)
  }

  return stdout.trimEnd()
}
