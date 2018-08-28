export class BashScript {

  public readonly dirname = "$(cd \"$(dirname \"${BASH_SOURCE[0]}\")/..\" && pwd)"
  public readonly shebang = "#!/usr/bin/env bash"

  private readonly lines: string[] = []

  public add = (line = "") => {
    this.lines.push(line)
  }

  public env = (key: string, value: string) => {
    this.add(`export ${key}="${value}"`)
  }

  public prependEnv = (key: string, value: string) => {
    this.add(`export ${key}="${value}:$${key}"`)
  }

  public appendEnv = (key: string, value: string) => {
    this.add(`export ${key}="$${key}:${value}"`)
  }

  public comment = (line = "") => {
    this.add(`# ${line}`)
  }

  public section = (...lines: string[]) => {
    this.add(`#`)
    this.add(`#`)
    lines.forEach(line => this.add(`#   ${line}`))
    this.add(`#`)
    this.add(`# ==========================================================`)
  }

  public alias = (name: string, replacement: string) => {
    this.add(`alias ${name}='${replacement}'`)
    return (more = "") => [name, more].join(" ").trim()
  }

public function = (name: string, lines: string[]) => {
    this.add(`${name}() {`)
    lines.forEach(line => this.add(`  ${line}`))
    this.add(`}`)
  }

  public switch   = (fnName: string, fallback: string, mapping: { [index: string]: string }) => {
    this.add(`${fnName}() {`)
    this.add("  args=\"$@\"")
    this.add("  command=\"$1\"")
    this.add("  shift")
    this.add("  rest=\"$@\"")
    this.add("")
    this.add("  if false; then echo false")

    Object.keys(mapping).forEach(key => {
      this.add(`  elif [ "$command" == "${key}" ]; then`)
      this.add(`    ${mapping[key]} "$rest"`)
    })

    this.add(`  else`)
    this.add(`    ${fallback} "$args"`)
    this.add("  fi")
    this.add("}")
  }

  public toString = () => {
    return this.lines.join("\n")
  }

}
