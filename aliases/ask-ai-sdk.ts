import { readdir, readFile, realpath } from "node:fs/promises"
import { isAbsolute, join, relative, resolve } from "node:path"
import { type GatewayModelId, gateway, jsonSchema, stepCountIs, streamText, tool } from "ai"

const maxToolOutput = 50_000
const maxFiles = 5_000
const ignoredDirectories = new Set([".cache", ".git", ".next", "build", "coverage", "dist", "node_modules"])
const reasoningLevels = ["provider-default", "none", "low", "medium", "high", "xhigh"] as const
type ReasoningLevel = (typeof reasoningLevels)[number]
const prompt = process.argv.slice(2).join(" ").trim()
const root = await realpath(process.cwd())

if (!prompt) {
  console.error("Usage: oask-ai-sdk <question>")
  process.exit(1)
}

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error("Please set AI_GATEWAY_API_KEY")
  process.exit(1)
}

const reasoning = (process.env.ASK_REASONING ?? "provider-default") as ReasoningLevel
if (!reasoningLevels.some((level) => level === reasoning)) {
  console.error(`ASK_REASONING must be one of: ${reasoningLevels.join(", ")}`)
  process.exit(1)
}

function clip(value: string): string {
  if (value.length <= maxToolOutput) return value
  return `${value.slice(0, maxToolOutput)}\n[output truncated]`
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.split("\n", 1)[0] ?? error.name
  return String(error)
}

async function listRepoFiles(): Promise<string[]> {
  const files: string[] = []

  async function walk(directory: string) {
    if (files.length >= maxFiles) return

    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      if (files.length >= maxFiles) return
      if (entry.isSymbolicLink()) continue

      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) await walk(absolutePath)
      } else if (entry.isFile()) {
        files.push(relative(root, absolutePath))
      }
    }
  }

  await walk(root)
  return files
}

function matchesGlob(path: string, glob?: string): boolean {
  return glob ? new Bun.Glob(glob).match(path) : true
}

async function resolveRepoPath(path: string): Promise<string> {
  const candidate = isAbsolute(path) ? path : resolve(root, path)
  const resolved = await realpath(candidate)
  const relativePath = relative(root, resolved)

  if (relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath))) {
    return resolved
  }

  throw new Error(`Path is outside the repository: ${path}`)
}

const tools = {
  listFiles: tool({
    description: "List files in the current repository. Optionally restrict results with a glob.",
    inputSchema: jsonSchema<{ glob?: string }>({
      type: "object",
      properties: { glob: { type: "string" } },
      additionalProperties: false,
    }),
    execute: async ({ glob }) => {
      const files = (await listRepoFiles()).filter((path) => matchesGlob(path, glob))
      const suffix = files.length >= maxFiles ? "\n[file list truncated]" : ""
      return clip(`${files.join("\n")}${suffix}`)
    },
  }),
  searchFiles: tool({
    description: "Search repository text with a JavaScript regular expression.",
    inputSchema: jsonSchema<{ query: string; glob?: string }>({
      type: "object",
      properties: {
        query: { type: "string" },
        glob: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    }),
    execute: async ({ query, glob }) => {
      const expression = new RegExp(query, "u")
      const matches: string[] = []
      let outputLength = 0

      for (const path of await listRepoFiles()) {
        if (!matchesGlob(path, glob)) continue

        try {
          const contents = await readFile(join(root, path))
          if (contents.includes(0)) continue

          for (const [index, line] of contents.toString("utf8").split("\n").entries()) {
            expression.lastIndex = 0
            if (!expression.test(line)) continue

            const match = `${path}:${index + 1}:${line}`
            matches.push(match)
            outputLength += match.length + 1
            if (outputLength >= maxToolOutput) return clip(matches.join("\n"))
          }
        } catch {
          // Ignore unreadable and transient files.
        }
      }

      return matches.length > 0 ? matches.join("\n") : "No matches found."
    },
  }),
  readFile: tool({
    description: "Read a UTF-8 repository file, optionally selecting an inclusive line range.",
    inputSchema: jsonSchema<{ path: string; startLine?: number; endLine?: number }>({
      type: "object",
      properties: {
        path: { type: "string" },
        startLine: { type: "integer", minimum: 1 },
        endLine: { type: "integer", minimum: 1 },
      },
      required: ["path"],
      additionalProperties: false,
    }),
    execute: async ({ path, startLine = 1, endLine }) => {
      const contents = await readFile(await resolveRepoPath(path), "utf8")
      const lines = contents.split("\n")
      const end = Math.min(endLine ?? lines.length, lines.length)
      return clip(lines.slice(startLine - 1, end).join("\n"))
    },
  }),
}

try {
  const model = (process.env.ASK_MODEL ?? "openai/gpt-5.4-nano") as GatewayModelId
  const result = streamText({
    model: gateway(model),
    system: [
      "You are a read-only repository assistant.",
      "Use the available tools to inspect the current repository when the question depends on it.",
      "Answer directly and do not claim to have modified files.",
    ].join(" "),
    prompt,
    reasoning,
    tools,
    stopWhen: stepCountIs(10),
    onError: () => {},
  })

  let outputEndsWithNewline = true

  for await (const part of result.stream) {
    if (part.type === "error") throw part.error
    if (part.type !== "text-delta") continue

    const text = part.text.replaceAll("\r", "")
    if (!text) continue

    process.stdout.write(text)
    outputEndsWithNewline = text.endsWith("\n")
  }

  if (!outputEndsWithNewline) process.stdout.write("\n")
} catch (error) {
  console.error(getErrorMessage(error))
  process.exitCode = 1
}
