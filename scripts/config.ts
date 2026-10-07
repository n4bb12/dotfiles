import { readdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

import { $ } from "bun"
import { cursorUserDir } from "./cursor-agent-theme.ts"

export const cursorUserConfigFiles = ["settings.json", "keybindings.json"] as const

export async function copyTree(srcDir: string, destDir: string) {
  await $`mkdir -p ${destDir}`

  for (const entry of await readdir(srcDir, { withFileTypes: true })) {
    const src = join(srcDir, entry.name)
    const dest = join(destDir, entry.name)

    if (entry.isDirectory()) {
      await copyTree(src, dest)
      continue
    }

    await $`cp -a --remove-destination ${src} ${dest}`
  }
}

// Cursor writes these in place. A copy would drift from the repo; a symlink keeps one file.
export async function linkCursorUserConfig(sourceDir: string, userDir: string) {
  await $`mkdir -p ${userDir}`

  for (const name of cursorUserConfigFiles) {
    await $`ln -sfn ${join(sourceDir, name)} ${join(userDir, name)}`
  }
}

if (import.meta.main) {
  const root = join(import.meta.dir, "../config")

  await copyTree(join(root, "~"), homedir())
  await linkCursorUserConfig(join(root, "cursor"), cursorUserDir())

  let windows = process.env.USERPROFILE

  if (!windows && Bun.which("wslpath")) {
    windows = (await $`wslpath -u $(cmd.exe /c "echo %USERPROFILE%")`.cwd("/mnt/c").nothrow().text()).trim()
  }

  if (windows) {
    await copyTree(join(root, "%USERPROFILE%"), windows)
  }
}
