import { homedir } from "node:os"
import { join } from "node:path"

import { $ } from "bun"

const root = join(import.meta.dir, "../config")

await $`cp -a --remove-destination ${`${join(root, "~")}/.`} ${homedir()}`

let windows = process.env.USERPROFILE

if (!windows && Bun.which("wslpath")) {
  windows = (await $`wslpath -u $(cmd.exe /c "echo %USERPROFILE%")`.cwd("/mnt/c").nothrow().text()).trim()
}

if (windows) {
  await $`cp -a --remove-destination ${`${join(root, "%USERPROFILE%")}/.`} ${windows}`
}
