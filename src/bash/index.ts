import fs from "graceful-fs"
import path from "path"
import pify from "pify"

const exists = pify(fs.exists)
const readFile = pify(fs.readFile)
const writeFile = pify(fs.writeFile)

const partials = [
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

    if (await exists(srcFile)) {
      contents.push(await readFile(srcFile, "utf8"))
    } else if (await exists(generatedFile)) {
      contents.push(await readFile(generatedFile, "utf8"))
    } else {
      throw new Error("Bash partial does not exist: " + name)
    }
  }

  const combined = contents
    .map((content, index) => `# ${partials[index]}.sh\n${content}`)
    .join("\n\n\n")
  const outFile = path.join(process.cwd(), "generated", "bash", "index.sh")

  return writeFile(outFile, combined, "utf8")
}
