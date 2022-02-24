export class BashScript {
  readonly dirname = '$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)'
  readonly shebang = "#!/usr/bin/env bash"

  private readonly lines: string[] = []

  add = (line = "") => {
    this.lines.push(line)
  }

  env = (key: string, value: string) => {
    this.add(`export ${key}="${value}"`)
  }

  prependEnv = (key: string, value: string) => {
    this.add(`export ${key}="${value}:$${key}"`)
  }

  appendEnv = (key: string, value: string) => {
    this.add(`export ${key}="$${key}:${value}"`)
  }

  comment = (line = "") => {
    this.add(`# ${line}`)
  }

  section = (...lines: string[]) => {
    this.add(`#`)
    this.add(`#`)
    lines.forEach((line) => this.add(`#   ${line}`))
    this.add(`#`)
    this.add(`# ==========================================================`)
  }

  alias = (name: string, replacement: string) => {
    this.add(`alias ${name}='${replacement}'`)
    return (more = "") => [name, more].join(" ").trim()
  }

  function = (name: string, lines: string[]) => {
    this.add(`function ${name}() {`)
    lines.forEach((line) => this.add(`  ${line}`))
    this.add(`}`)
  }

  switch = (name: string, fallback: string, mapping: { [index: string]: string }) => {
    this.add(`function ${name}() {`)
    this.add('  args="$@"')
    this.add('  command="$1"')
    this.add("  shift")
    this.add('  rest="$@"')
    this.add("")
    this.add("  if false; then echo false")

    Object.keys(mapping).forEach((key) => {
      this.add(`  elif [ "$command" == "${key}" ]; then`)
      this.add(`    ${mapping[key]} "$rest"`)
    })

    this.add(`  else`)
    this.add(`    ${fallback} "$args"`)
    this.add("  fi")
    this.add("}")
  }

  toString = () => {
    return this.lines.join("\n")
  }
}
