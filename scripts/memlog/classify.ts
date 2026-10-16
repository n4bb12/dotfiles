import { basename, join, relative } from "node:path"

export type ProcessInfo = {
  comm: string
  args: string[]
  cwd?: string
  container?: string
}

export type Group = {
  label: string
  count: number
  rssMb: number
  swapMb: number
}

const TOOLS = [
  "tsserver",
  "tsgo",
  "tsc",
  "vitest",
  "jest",
  "playwright",
  "next-server",
  "next",
  "vite",
  "turbo",
  "biome",
  "eslint",
  "esbuild",
  "webpack",
  "storybook",
  "prisma",
  "prettier",
]

const AGENTS: Record<string, string> = {
  claude: "Claude Code",
  codex: "Codex",
  "cursor-agent": "Cursor Agent",
}

const RUNTIMES = new Set(["node", "bun", "deno", "python", "python3"])

function stripExtension(name: string) {
  return name.replace(/\.(c|m)?(j|t)s$/, "")
}

function findTool(comm: string, args: string[]) {
  const names = [comm, ...args.slice(0, 4).map((arg) => stripExtension(basename(arg)))]

  // Tools rename their worker processes, e.g. "node (vitest 3)" or "next-server (v15.2.0)".
  return TOOLS.find((tool) => names.some((name) => new RegExp(`(^|[\\s(])${tool}([\\s)]|$)`).test(name)))
}

function findEditor(args: string[]) {
  const executable = args[0] ?? ""

  if (executable.includes("/.cursor-server/")) {
    return "Cursor server"
  }

  if (executable.includes("/.vscode-server/")) {
    return "VS Code server"
  }
}

function describeRuntime(comm: string, args: string[]) {
  const words = args
    .slice(1)
    .filter((arg) => !arg.startsWith("-"))
    .slice(0, 2)
    .map((arg) => basename(arg))

  return [comm, ...words].join(" ")
}

export function describe(info: ProcessInfo) {
  if (info.container) {
    return `docker ${info.container}`
  }

  const executable = basename(info.args[0] ?? info.comm)

  return (
    findTool(info.comm, info.args) ??
    AGENTS[info.comm] ??
    AGENTS[executable] ??
    findEditor(info.args) ??
    (RUNTIMES.has(info.comm) ? describeRuntime(info.comm, info.args) : info.comm)
  )
}

/** Repos live at ~/code/<owner>/<repo>, so the second segment names the project. */
export function projectOf(cwd: string | undefined, home: string) {
  if (!cwd) {
    return
  }

  const rel = relative(join(home, "code"), cwd)

  if (!rel || rel.startsWith("..")) {
    return
  }

  const segments = rel.split("/")

  return segments[1] ?? segments[0]
}

export function labelOf(info: ProcessInfo, home: string) {
  const what = describe(info)
  const project = info.container ? undefined : projectOf(info.cwd, home)

  return project ? `${what} · ${project}` : what
}

export function groupBy<T>(
  items: T[],
  label: (item: T) => string,
  rssMb: (item: T) => number,
  swapMb: (item: T) => number,
) {
  const groups = new Map<string, Group>()

  for (const item of items) {
    const key = label(item)
    const group = groups.get(key) ?? { label: key, count: 0, rssMb: 0, swapMb: 0 }

    group.count += 1
    group.rssMb += rssMb(item)
    group.swapMb += swapMb(item)
    groups.set(key, group)
  }

  return [...groups.values()].sort((a, b) => b.rssMb + b.swapMb - (a.rssMb + a.swapMb))
}

/** Parses `tasklist.exe /fo csv /nh`. Memory is localized ("110.848 K" or "110,848 K"), so only digits count. */
export function parseTasklist(csv: string) {
  return csv
    .split(/\r?\n/)
    .map((line) => line.match(/^"([^"]*)","\d+","[^"]*","\d+","([^"]*)"/))
    .filter((match) => !!match)
    .map((match) => ({
      name: (match[1] ?? "").replace(/\.exe$/i, ""),
      mb: Math.round(Number((match[2] ?? "").replace(/\D/g, "")) / 1024),
    }))
}

/** Flattens `.wslconfig` to its settings. Keys are unique across its sections, so the section is dropped. */
export function parseWslconfig(text: string) {
  const entries = text
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(\w+)\s*=\s*([^#;]*?)\s*([#;].*)?$/))
    .filter((match) => !!match)
    .map((match) => [match[1] ?? "", match[2] ?? ""])

  return Object.fromEntries(entries)
}
