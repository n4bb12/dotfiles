import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { $ } from "bun"

import { backup, collectBackupPaths } from "./backup.ts"

const tmpDirs: string[] = []

afterEach(async () => {
  await Promise.all(tmpDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function tmp() {
  const cache = join(import.meta.dir, "../.cache")
  await mkdir(cache, { recursive: true })
  const dir = await mkdtemp(join(cache, "backup-"))
  tmpDirs.push(dir)
  return dir
}

async function gitInit(dir: string) {
  await $`git init ${dir}`.quiet()
}

async function gitAdd(repo: string, rel: string) {
  await $`git -C ${repo} add -f -- ${rel}`.quiet()
}

async function gitIgnore(repo: string, contents: string) {
  await writeFile(join(repo, ".gitignore"), contents)
}

function rels(root: string, paths: string[]) {
  return paths.map((path) => path.slice(root.length + 1))
}

async function listRelativeFiles(dir: string) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(dir.length + 1))
    .sort()
}

describe("collectBackupPaths", () => {
  test("collects gitignored env files and secret folders, not tracked or merely untracked files", async () => {
    const root = await tmp()
    const repo = join(root, "app")

    await mkdir(join(repo, "notes"), { recursive: true })
    await mkdir(join(repo, "secrets"), { recursive: true })
    await mkdir(join(repo, "src", "data"), { recursive: true })
    await mkdir(join(repo, "node_modules", "pkg"), { recursive: true })

    await writeFile(join(repo, ".env.example"), "TRACKED=1\n")
    await writeFile(join(repo, ".env.local"), "SECRET=1\n")
    await writeFile(join(repo, ".env"), "SECRET=2\n")
    await writeFile(join(repo, ".envrc"), "SECRET=3\n")
    await writeFile(join(repo, "notes", "todo.md"), "untracked note\n")
    await writeFile(join(repo, "secrets", "key"), "untracked secret\n")
    await writeFile(join(repo, "src", "data", "seed.json"), "tracked\n")
    await writeFile(join(repo, "src", "data", "local.db"), "untracked\n")
    await writeFile(join(repo, "src", "data", "heroFeatures.tsx"), "source\n")
    await writeFile(join(repo, "readme.md"), "tracked\n")
    await writeFile(join(repo, "node_modules", "pkg", ".env"), "skip\n")

    await gitInit(repo)
    await gitIgnore(
      repo,
      `.env*
!.env.example
notes/
secrets/
*.db
node_modules/
`,
    )
    await gitAdd(repo, ".env.example")
    await gitAdd(repo, "src/data/seed.json")
    await gitAdd(repo, "readme.md")

    expect(rels(root, await collectBackupPaths(root))).toMatchInlineSnapshot(`
      [
        "app/.env",
        "app/.env.local",
        "app/.envrc",
        "app/notes/todo.md",
        "app/secrets/key",
        "app/src/data/local.db",
      ]
    `)
  })

  test("includes gitignored env files, not untracked or tracked ones", async () => {
    const root = await tmp()

    await writeFile(join(root, ".env.example"), "UNTRACKED=1\n")
    await writeFile(join(root, ".env.local"), "IGNORED=1\n")
    await writeFile(join(root, ".env.tracked"), "TRACKED=1\n")

    await gitInit(root)
    await gitIgnore(
      root,
      `.env.local
.env.tracked
`,
    )
    await gitAdd(root, ".env.tracked")

    expect(rels(root, await collectBackupPaths(root))).toMatchInlineSnapshot(`
      [
        ".env.local",
      ]
    `)
  })

  test("skips matching files outside a git repo", async () => {
    const root = await tmp()

    await mkdir(join(root, "notes"))
    await writeFile(join(root, ".env"), "SECRET=1\n")
    await writeFile(join(root, "notes", "idea.md"), "note\n")
    await writeFile(join(root, "plain.txt"), "skip\n")

    expect(rels(root, await collectBackupPaths(root))).toEqual([])
  })
})

describe("backup", () => {
  test("writes a folder of collected relative paths", async () => {
    const root = await tmp()
    const destDir = await tmp()

    await mkdir(join(root, "notes"))
    await writeFile(join(root, ".env.local"), "SECRET=1\n")
    await writeFile(join(root, "notes", "todo.md"), "note\n")

    await gitInit(root)
    await gitIgnore(
      root,
      `.env.local
notes/
`,
    )

    const result = await backup({ destDir, root })

    expect(typeof result.dir).toBe("string")
    expect((await stat(result.dir!)).isDirectory()).toBe(true)
    expect(await listRelativeFiles(result.dir!)).toMatchInlineSnapshot(`
      [
        ".env.local",
        "notes/todo.md",
      ]
    `)
    expect(await readFile(join(result.dir!, ".env.local"), "utf8")).toBe("SECRET=1\n")
    expect(await readFile(join(result.dir!, "notes/todo.md"), "utf8")).toBe("note\n")
  })
})
