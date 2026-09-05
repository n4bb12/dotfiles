import { join } from "node:path"

import { $ } from "bun"

const sources = [
  // wrap-line
  "mattpocock/skills",
  join(import.meta.dir, "../config/~/.agents/skills"),
] as const

for (const source of sources) {
  await $`bunx skills add ${source} --global --all`
}
