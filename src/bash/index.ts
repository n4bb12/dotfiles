import fs from "graceful-fs"
import { promisify } from "util"

import { partials } from "./load-order"
import util from "./util"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export default async function generateIndex() {
  const contents = await Promise.all(partials.map(readPartial))
  const combined = combine(contents)
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

function combine(contents: string[]): string {
  const isAlias = /^alias /
  const isRequirement = /^require-(?:binary|node-package)[^()]+$/
  const isOnelineFunction = /^[\w-_]+\(\)\s+{.*?}$/

  const lines = contents
    .join("\n")
    .split("\n")

  const remaining = lines
    .filter(line => {
      return true
        && !isOnelineFunction.test(line)
        && !isAlias.test(line)
        && !isRequirement.test(line)
    })

  const onelineFunctions = lines
    .filter(line => isOnelineFunction.test(line))

  const aliases = lines
    .filter(line => isAlias.test(line))

  const requirements = lines
    .filter(line => isRequirement.test(line))

  return [
    ...remaining, "",
    ...onelineFunctions.sort(), "",
    ...aliases.sort(), "",
    ...requirements.sort(),
  ].join("\n")
}

async function readPartial(name: string) {
  const filename = name + ".sh"
  const srcFile = util.cwd("src/bash-partials", filename)
  const generatedFile = util.cwd("build/bash-partials", filename)

  if (fs.existsSync(srcFile)) {
    return readScript(srcFile)
  } else if (fs.existsSync(generatedFile)) {
    return readScript(generatedFile)
  } else {
    throw new Error("Bash partial does not exist: " + name)
  }
}
