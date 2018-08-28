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
        others.forEach((other) => this.alias(other, alias))
      },
    }
  }

  public outputTo = async (...paths: string[]) => {
    const file = path.join(...paths)
    await writeFile(file, this.toString(), "utf8")
  }

}
