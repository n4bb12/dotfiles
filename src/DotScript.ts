import fs from "graceful-fs"
import { promisify } from "util"

import { BashScript } from "./BashScript"
import util from "./util"

const writeFile = promisify(fs.writeFile)

export class DotScript extends BashScript {
  browse = (name: string, url: string) => {
    this.add(`function ${name}() { browser '${url}' "$@"; }`)
    return {
      alias: (...others: string[]) => {
        others.forEach((other) => this.alias(other, name))
      },
    }
  }

  outputTo = async (filenameAbs: string) => {
    const filename = util.filename(filenameAbs) + ".sh"
    const outFile = util.cwd("build/bash-partials", filename)
    await writeFile(outFile, this.toString(), "utf8")
  }
}
