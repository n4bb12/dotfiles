import fs from "graceful-fs"
import { promisify } from "util"

import { partials } from "./load-order"
import util from "./util"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export default async function generateIndex() {
  const contents: string[] = []

  for (const name of partials) {
    const filename = name + ".sh"
    const srcFile = util.cwd("src/bash-partials", filename)
    const generatedFile = util.cwd("build/bash-partials", filename)

    if (fs.existsSync(srcFile)) {
      contents.push(await readScript(srcFile))
    } else if (fs.existsSync(generatedFile)) {
      contents.push(await readScript(generatedFile))
    } else {
      throw new Error("Bash partial does not exist: " + name)
    }
  }

  const combined = contents.join("\n")
  const outFile = util.cwd("build/bash/index.sh")

  return writeFile(outFile, combined, "utf8")
}

async function readScript(file: string) {
  const text: string = await readFile(file, "utf8")
  return text
    .replace(/[\r\n]+/, "\n")
    .split("\n")
    .filter(line => line.trim())
    .map(line => line.replace(/alias\s+/, "alias "))
    .filter(line => !line.startsWith("#"))
    .join("\n")
}
