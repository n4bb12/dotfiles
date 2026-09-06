import { afterAll, afterEach, describe, expect, test } from "bun:test"
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { run } from "./cli.ts"
import { defaultRunner, detectHostKind, originHostname } from "./git.ts"
import { MrError, WORKSPACE_DIR } from "./types.ts"

const repos: string[] = []
const gitEnv = {
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com",
}

let templateRepo: string | undefined

afterEach(() => {
  for (const root of repos.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

afterAll(() => {
  if (templateRepo) {
    rmSync(templateRepo, { recursive: true, force: true })
  }
})

describe("host detection", () => {
  test("reads github and gitlab remotes", () => {
    expect(originHostname("git@github.com:n4bb12/app.git")).toBe("github.com")
    expect(detectHostKind("git@github.com:n4bb12/app.git")).toBe("github")
    expect(detectHostKind("https://gitlab.crossload.org/group/app.git")).toBe("gitlab")
  })
})

describe("mr cli", () => {
  test("init stores the base branch and ignore line", async () => {
    const { repo } = createRepo()
    const logs: string[] = []

    await run(["init", "--base", "main"], testIo(repo, logs))

    const config = JSON.parse(await Bun.file(join(repo, WORKSPACE_DIR, "config.json")).text()) as { baseBranch: string }
    const exclude = await Bun.file(join(repo, ".git/info/exclude")).text()
    const analysis = await Bun.file(join(repo, WORKSPACE_DIR, "analysis.json")).text()

    expect(config.baseBranch).toBe("main")
    expect(exclude).toContain(`${WORKSPACE_DIR}/`)
    expect(analysis).toContain("feat/checkout")
    expect(logs.join("\n")).toContain("Base branch: main")

    await run(["init", "--base", "main"], testIo(repo, []))

    expect(
      (await Bun.file(join(repo, ".git/info/exclude")).text()).match(
        new RegExp(`^${WORKSPACE_DIR.replaceAll(".", "\\.")}/$`, "gm"),
      )?.length,
    ).toBe(1)
  })

  test("keeps the stored base branch until the workspace is deleted", async () => {
    const { repo } = createRepo()

    await run(["init", "--base", "main"], testIo(repo, []))
    await run(["init"], testIo(repo, []))

    const kept = JSON.parse(await Bun.file(join(repo, WORKSPACE_DIR, "config.json")).text()) as { baseBranch: string }

    expect(kept.baseBranch).toBe("main")

    rmSync(join(repo, WORKSPACE_DIR), { recursive: true, force: true })
    await run(["init", "--base", "develop"], testIo(repo, []))

    const reset = JSON.parse(await Bun.file(join(repo, WORKSPACE_DIR, "config.json")).text()) as { baseBranch: string }

    expect(reset.baseBranch).toBe("develop")
  })

  test("status reports missing local images", async () => {
    const { repo } = createRepo()

    writeWorkspace(repo, "| ![Before](./screenshots/01-before.png) | ![After](./screenshots/01-after.png) |\n")
    mkdirSync(join(repo, WORKSPACE_DIR, "screenshots"), { recursive: true })
    writeFileSync(join(repo, WORKSPACE_DIR, "screenshots/01-after.png"), "after")

    const logs: string[] = []

    try {
      await run(["status"], testIo(repo, logs))
      throw new Error("expected status to fail")
    } catch (error) {
      expect(error).toBeInstanceOf(MrError)
      expect(String(error)).toContain("01-before.png")
    }

    expect(logs.join("\n")).toContain("✗ ./screenshots/01-before.png")
    expect(logs.join("\n")).toContain("✓ ./screenshots/01-after.png")
  })

  test("status fails when workspace files are missing", async () => {
    const { repo } = createRepo()

    try {
      await run(["status"], testIo(repo, []))
      throw new Error("expected status to fail")
    } catch (error) {
      expect(error).toBeInstanceOf(MrError)
      expect(String(error)).toContain("mr init")
    }
  })

  test("status succeeds when there are no local images", async () => {
    const { repo } = createRepo()

    writeWorkspace(repo, "## Summary\n\nNo screenshots.\n")

    const logs: string[] = []

    await run(["status"], testIo(repo, logs))

    expect(logs.join("\n")).toContain("No local images")
  })

  test("create uses gh --attach from the workspace without pushing", async () => {
    const { repo } = createRepo()
    const calls: string[][] = []

    writeWorkspace(repo, "![Before](./screenshots/01-before.png)\n")
    mkdirSync(join(repo, WORKSPACE_DIR, "screenshots"), { recursive: true })
    writeFileSync(join(repo, WORKSPACE_DIR, "screenshots/01-before.png"), "before")

    const logs: string[] = []

    await run(["create", "--title", "Improve checkout"], {
      ...testIo(repo, logs),
      which: (name) => (name === "glab" ? null : `/bin/${name}`),
      runner: async (input) => {
        if (input.argv[0] === "git") {
          return defaultRunner({
            ...input,
            env: { ...gitEnv, ...input.env },
          })
        }

        calls.push(input.argv)

        if (input.argv[1] === "auth") {
          return { code: 0, stdout: "logged in", stderr: "" }
        }

        if (input.argv[1] === "pr" && input.argv[2] === "create" && input.argv[3] === "--help") {
          return { code: 0, stdout: "      --attach   Attach a file", stderr: "" }
        }

        if (input.argv[1] === "pr" && input.argv[2] === "view") {
          return { code: 1, stdout: "", stderr: "no pr" }
        }

        if (input.argv[1] === "pr" && input.argv[2] === "create") {
          expect(input.cwd).toBe(join(repo, WORKSPACE_DIR))
          expect(input.env?.GH_PROMPT_DISABLED).toBe("1")
          expect(input.argv).toContain("--head")
          expect(input.argv).toContain("--attach")
          expect(input.argv).toContain("screenshots/01-before.png")
          expect(input.argv).not.toContain("--push")

          return { code: 0, stdout: "https://github.com/n4bb12/app/pull/9", stderr: "" }
        }

        return { code: 1, stdout: "", stderr: input.argv.join(" ") }
      },
    })

    expect(logs.join("\n")).toContain("https://github.com/n4bb12/app/pull/9")
    expect(calls.some((argv) => argv.includes("--attach"))).toBe(true)
  })
})

function testIo(repo: string, logs: string[]) {
  return {
    cwd: repo,
    log: (message: string) => logs.push(message),
    warn: (message: string) => logs.push(message),
    stdinTty: false,
    which: (name: string) => (["git", "bun"].includes(name) ? `/bin/${name}` : null),
    runner: async (input: Parameters<typeof defaultRunner>[0]) => {
      if (input.argv[0] !== "git") {
        return { code: 1, stdout: "", stderr: `${input.argv[0]} is not available in tests` }
      }

      return defaultRunner({
        ...input,
        env: { ...gitEnv, ...input.env },
      })
    },
    choose: async () => {
      throw new Error("choose should not run")
    },
  }
}

function writeWorkspace(repo: string, description: string) {
  mkdirSync(join(repo, WORKSPACE_DIR), { recursive: true })
  writeFileSync(join(repo, WORKSPACE_DIR, "config.json"), `${JSON.stringify({ baseBranch: "main" }, null, 2)}\n`)
  writeFileSync(join(repo, WORKSPACE_DIR, "description.md"), description)
}

function createRepo() {
  const root = mkdtempSync(join(tmpdir(), "mr-cli-"))
  const repo = join(root, "repo")

  repos.push(root)
  cpSync(template(), repo, { recursive: true })

  return { root, repo }
}

function template() {
  if (templateRepo) {
    return templateRepo
  }

  const repo = mkdtempSync(join(tmpdir(), "mr-cli-template-"))

  git(repo, ["init", "-b", "main"])
  git(repo, ["config", "core.fsmonitor", "false"])
  git(repo, ["config", "core.untrackedCache", "false"])
  git(repo, ["config", "commit.gpgsign", "false"])
  writeFileSync(join(repo, "app.js"), "base\n")
  git(repo, ["add", "."])
  git(repo, ["commit", "--no-verify", "-m", "init"])
  git(repo, ["branch", "develop"])
  git(repo, ["checkout", "-b", "feat/checkout"])
  writeFileSync(join(repo, "app.js"), "feature\n")
  git(repo, ["add", "."])
  git(repo, ["commit", "--no-verify", "-m", "Improve checkout layout"])
  git(repo, ["remote", "add", "origin", "git@github.com:n4bb12/app.git"])
  templateRepo = repo

  return repo
}

function git(cwd: string, args: string[]) {
  const result = Bun.spawnSync(["git", "-c", "core.fsmonitor=false", "-C", cwd, ...args], {
    cwd,
    env: { ...process.env, ...gitEnv },
    stdout: "pipe",
    stderr: "pipe",
  })

  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString() || result.stdout.toString() || `git ${args.join(" ")} failed`)
  }

  return result.stdout.toString().trimEnd()
}
