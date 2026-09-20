import { join } from "node:path"

import { $ } from "bun"

const sources = [
  // wrap-line
  "mattpocock/skills",
  "pbakaus/impeccable",
  "tt-a1i/archify",
  "typesafe-ai/skills",
  join(import.meta.dir, "../config/~/.agents/skills"),
] as const

await $`rm -rf ~/.agents/skills`

for (const source of sources) {
  await $`bunx skills add ${source} --global --skill '*' --yes --agent universal`
}
