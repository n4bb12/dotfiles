import * as fs from "graceful-fs"
import * as path from "path"
import * as pify from "pify"

const writeFile = pify(fs.writeFile)

export class BashScript {
  private lines: string[] = []

  public toString = () => {
    return this.lines.join("\n")
  }

  public outputTo = async (...paths: string[]) => {
    const file = path.join(...paths)
    await writeFile(file, this.toString(), "utf8")
  }

  public comment = (line = "") => {
    this.push(`# ${line}`)
  }

  public section = (...lines: string[]) => {
    this.push(`#`)
    this.push(`#`)
    lines.forEach((line) => this.push(`#   ${line}`))
    this.push(`#`)
    this.push(`# ==========================================================`)
  }

  public alias = (alias: string, replacement: string) => {
    this.push(`alias ${alias}='${replacement}'`)
    return (more = "") => [alias, more].join(" ").trim()
  }

  public switch = (fnName: string, fallback: string, mapping: { [index: string]: string }) => {
    this.push(`${fnName}() {`)
    this.push("  args=\"$@\"")
    this.push("  command=\"$1\"")
    this.push("  shift")
    this.push("  rest=\"$@\"")
    this.push("")
    this.push("  if false; then echo false")

    Object.keys(mapping).forEach((key) => {
      this.push(`  elif [ "$command" == "${key}" ]; then`)
      this.push(`    ${mapping[key]} "$rest"`)
    })

    this.push(`  else`)
    this.push(`    ${fallback} "$args"`)
    this.push("  fi")
    this.push("}")
  }

  public push = (line = "") => {
    this.lines.push(line)
  }
}
