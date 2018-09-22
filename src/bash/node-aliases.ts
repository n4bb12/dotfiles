import { lstatSync, readdirSync } from "fs"
import { join } from "path"

import { DotScript } from "./DotScript"

export default function generate() {
  const jsRoot = join(process.cwd(), "generated/node")
  const jsFiles = findJsPartials(jsRoot)

  const sh = new DotScript()
  sh.section("Node Aliases")

  jsFiles.forEach(name => {
    sh.alias(name, `node "$DOT_ROOT/node/${name}.js"`)
  })

  return sh.outputTo(__filename)
}

function findJsPartials(dir: string) {
  return readdirSync(dir)
    .map(name => join(dir, name))
    .filter(isFile)
    .filter(file => file.endsWith(".js"))
}

function isFile(source: string) {
  return lstatSync(source).isFile()
}
