import Nehemiah from "nehemiah"

import { DotScript } from "./DotScript"
import util from "./util"

export async function generateNodeAliases() {
  const n = new Nehemiah()
  const files = await n.find("build/node/*.js")
  const fileNames = files.map(util.filename)

  const sh = new DotScript()
  sh.section("Node Aliases")

  fileNames.forEach(name => {
    sh.alias(name, `node "$DOT_ROOT/node/${name}.js"`)
  })

  return sh.outputTo(__filename)
}
