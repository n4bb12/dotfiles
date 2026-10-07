import { afterEach, describe, expect, test } from "bun:test"
import { lstat, mkdir, mkdtemp, readFile, readlink, rm, symlink, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { copyTree, linkCursorUserConfig } from "./config.ts"

const tmpDirs: string[] = []

afterEach(async () => {
  await Promise.all(tmpDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function tmp() {
  const cache = join(import.meta.dir, "../.cache")
  await mkdir(cache, { recursive: true })
  const dir = await mkdtemp(join(cache, "config-"))
  tmpDirs.push(dir)
  return dir
}

describe("copyTree", () => {
  test("copies into a destination directory symlink instead of replacing it", async () => {
    const root = await tmp()
    const src = join(root, "src")
    const dest = join(root, "dest")
    const realAws = join(root, "real-aws")

    await mkdir(join(src, ".aws"), { recursive: true })
    await mkdir(dest)
    await mkdir(realAws)
    await writeFile(join(src, ".aws", "config"), "from-repo\n")
    await writeFile(join(realAws, "credentials"), "existing\n")
    await symlink(realAws, join(dest, ".aws"))

    await copyTree(src, dest)

    expect((await lstat(join(dest, ".aws"))).isSymbolicLink()).toBe(true)
    expect(await readFile(join(realAws, "config"), "utf8")).toBe("from-repo\n")
    expect(await readFile(join(realAws, "credentials"), "utf8")).toBe("existing\n")
  })

  test("overwrites existing files in a real destination directory", async () => {
    const root = await tmp()
    const src = join(root, "src")
    const dest = join(root, "dest")

    await mkdir(src)
    await mkdir(dest)
    await writeFile(join(src, ".gitignore"), "from-repo\n")
    await writeFile(join(dest, ".gitignore"), "old\n")

    await copyTree(src, dest)

    expect(await readFile(join(dest, ".gitignore"), "utf8")).toBe("from-repo\n")
  })
})

describe("linkCursorUserConfig", () => {
  test("replaces regular Cursor user files with symlinks to the repo copies", async () => {
    const root = await tmp()
    const source = join(root, "cursor")
    const user = join(root, "User")

    await mkdir(source)
    await mkdir(user)
    await writeFile(join(source, "settings.json"), "from-repo\n")
    await writeFile(join(source, "keybindings.json"), "bindings\n")
    await writeFile(join(user, "settings.json"), "old\n")
    await writeFile(join(user, "keybindings.json"), "old\n")

    await linkCursorUserConfig(source, user)
    await linkCursorUserConfig(source, user)

    for (const name of ["settings.json", "keybindings.json"]) {
      const dest = join(user, name)
      expect((await lstat(dest)).isSymbolicLink()).toBe(true)
      expect(await readlink(dest)).toBe(join(source, name))
    }

    expect(await readFile(join(user, "settings.json"), "utf8")).toBe("from-repo\n")
  })
})
