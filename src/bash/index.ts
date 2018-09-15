import fs from "graceful-fs"
import path from "path"
import pify from "pify"

const readFile = pify(fs.readFile)
const writeFile = pify(fs.writeFile)

const partials = [
  "index",
  "fs",
  "colors",
  "explorer",

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
  "npm",
  "npm-name-available",
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
    const srcFile = path.join(process.cwd(), "src", "bash", "partials", filename)
    const generatedFile = path.join(process.cwd(), "generated", "bash", "partials", filename)

    if (fs.existsSync(srcFile)) {
      contents.push(await readScript(srcFile))
    } else if (fs.existsSync(generatedFile)) {
      contents.push(await readScript(generatedFile))
    } else {
      throw new Error("Bash partial does not exist: " + name)
    }
  }

  const combined = contents.join("\n")
  const outFile = path.join(process.cwd(), "generated", "bash", "index.sh")

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
