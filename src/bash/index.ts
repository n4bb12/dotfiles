import fs from "graceful-fs"
import { promisify } from "util"

import util from "./util"

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const partials = [
  "header",

  // --> header
  "colors",
  "explorer",
  "fs",

  // --> colors
  "env",

  // --> env
  "git",
  "node-global",
  "whoami",

  // --> node-global
  "angular",
  "bitly",
  "browser",
  "change-case",
  "clipboard",
  "docker",
  "free-port",
  "http-server",
  "kill",
  "node-aliases",
  "nodemon",
  "npm-name-available",
  "npm",
  "open",
  "pnpm",
  "sort-package-json",
  "ssh-agent",
  "tldr",
  "tunnel",
  "typescript",
  "underscore",
  "ungit",
  "words",
  "yarn",

  // --> browser
  "web-google",
  "web-ids",
  "web-refs",
  "web-resources",
  "web-search",
  "web-sites",
  "web-tools",
]

export default async function generateIndex() {
  const contents: string[] = []

  for (const name of partials) {
    const filename = name + ".sh"
    const srcFile = util.cwd("src/bash-partials", filename)
    const generatedFile = util.cwd("generated/bash-partials", filename)

    if (fs.existsSync(srcFile)) {
      contents.push(await readScript(srcFile))
    } else if (fs.existsSync(generatedFile)) {
      contents.push(await readScript(generatedFile))
    } else {
      throw new Error("Bash partial does not exist: " + name)
    }
  }

  const combined = contents.join("\n")
  const outFile = util.cwd("generated/bash/index.sh")

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
