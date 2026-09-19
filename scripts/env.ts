import { join } from "node:path"

import { config } from "dotenv"

export function loadDotenv() {
  config({ path: join(import.meta.dir, "../.env.local"), quiet: true })
}
