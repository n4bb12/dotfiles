import fs from "graceful-fs"
import path from "path"
import pify from "pify"

import { BashScript } from "./BashScript"

const writeFile = pify(fs.writeFile)

export class DotScript extends BashScript {

  public browse = (alias: string, url: string) => {
    this.add(`${alias}() { browser '${url}' "$@"; }`)
    return {
      alias: (...others: string[]) => {
        others.forEach(other => this.alias(other, alias))
      },
    }
  }

  public outputTo = async (filenameAbs: string) => {
    const filename = path.basename(filenameAbs, path.extname(filenameAbs)) + ".sh"
    const outFile = path.join(process.cwd(), "generated", "bash", filename)
    await writeFile(outFile, this.toString(), "utf8")
  }

}
