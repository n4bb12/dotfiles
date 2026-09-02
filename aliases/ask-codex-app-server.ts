import { spawn } from "node:child_process"
import { createInterface } from "node:readline"

type JsonObject = Record<string, unknown>
type PendingRequest = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

const prompt = process.argv.slice(2).join(" ").trim()
const debug = process.env.ASK_DEBUG === "1"
const finalOnly = process.env.ASK_FINAL_ONLY === "1"
const startedAt = performance.now()

if (!prompt) {
  console.error("Usage: oask-app-server <question>")
  process.exit(1)
}

const server = spawn("codex", ["app-server", "--stdio"], {
  cwd: process.cwd(),
  stdio: ["pipe", "pipe", "pipe"],
})

const pending = new Map<number, PendingRequest>()
const messagePhases = new Map<string, string | null>()
const streamedMessageIds = new Set<string>()
let nextRequestId = 0
let turnFinished: PromiseWithResolvers<JsonObject> | undefined
let serverError = ""
let outputEndsWithNewline = true
let shuttingDown = false

server.stderr.setEncoding("utf8")
server.stderr.on("data", (chunk: string) => {
  serverError = `${serverError}${chunk}`.slice(-16_384)
})

function send(message: JsonObject) {
  server.stdin.write(`${JSON.stringify(message)}\n`)
}

function request<T>(method: string, params: JsonObject): Promise<T> {
  const id = nextRequestId++

  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      resolve: (value) => resolve(value as T),
      reject,
    })
    send({ id, method, params })
  })
}

function writeOutput(value: string) {
  const normalized = value.replaceAll("\r", "")
  if (!normalized) return

  process.stdout.write(normalized)
  outputEndsWithNewline = normalized.endsWith("\n")
}

function fail(error: Error) {
  for (const handler of pending.values()) handler.reject(error)
  pending.clear()
  turnFinished?.reject(error)
}

function completeTurn(turn: JsonObject) {
  if (!turnFinished) return

  if (turn.status === "failed") {
    const error = isObject(turn.error) ? turn.error.message : undefined
    turnFinished.reject(new Error(typeof error === "string" ? error : "Codex turn failed"))
  } else if (turn.status === "interrupted") {
    turnFinished.reject(new Error("Codex turn was interrupted"))
  } else {
    turnFinished.resolve(turn)
  }
}

const lines = createInterface({ input: server.stdout })
lines.on("line", (line) => {
  let message: JsonObject

  try {
    const parsed: unknown = JSON.parse(line)
    if (!isObject(parsed)) return
    message = parsed
  } catch {
    return
  }

  if (debug && typeof message.method === "string") {
    const params = isObject(message.params) ? message.params : {}
    const delta = typeof params.delta === "string" ? ` ${params.delta.length} chars` : ""
    console.error(`[${Math.round(performance.now() - startedAt)}ms] ${message.method}${delta}`)
  }

  if (typeof message.id === "number" && ("result" in message || "error" in message)) {
    const handler = pending.get(message.id)
    if (!handler) return
    pending.delete(message.id)

    if (isObject(message.error)) {
      const error = message.error.message
      handler.reject(new Error(typeof error === "string" ? error : "App Server request failed"))
    } else {
      handler.resolve(message.result)
    }
    return
  }

  if (message.method === "item/started" && isObject(message.params)) {
    const item = message.params.item
    if (isObject(item) && item.type === "agentMessage" && typeof item.id === "string") {
      messagePhases.set(item.id, typeof item.phase === "string" ? item.phase : null)
    }
    return
  }

  if (message.method === "item/agentMessage/delta" && isObject(message.params)) {
    const { delta, itemId } = message.params
    if (
      typeof delta === "string" &&
      typeof itemId === "string" &&
      (!finalOnly || messagePhases.get(itemId) !== "commentary")
    ) {
      writeOutput(delta)
      streamedMessageIds.add(itemId)
    }
    return
  }

  if (message.method === "item/completed" && isObject(message.params)) {
    const item = message.params.item
    if (
      isObject(item) &&
      item.type === "agentMessage" &&
      typeof item.id === "string" &&
      streamedMessageIds.has(item.id) &&
      !outputEndsWithNewline
    ) {
      process.stdout.write("\n")
      outputEndsWithNewline = true
    }
    return
  }

  if (message.method === "turn/completed" && isObject(message.params)) {
    const turn = message.params.turn
    if (isObject(turn)) completeTurn(turn)
  }
})

server.on("error", (error) => {
  fail(error)
})

server.on("close", (code) => {
  if (shuttingDown) return
  const details = serverError.trim()
  fail(new Error(details || `Codex App Server exited with status ${code ?? "unknown"}`))
})

async function main() {
  await request("initialize", {
    clientInfo: {
      name: "n4bb12_ask_app_server",
      title: "n4bb12a Ask App Server",
      version: "1.0.0",
    },
    capabilities: null,
  })
  send({ method: "initialized", params: {} })

  const thread = await request<{ thread: { id: string } }>("thread/start", {
    cwd: process.cwd(),
    approvalPolicy: "never",
    sandbox: "read-only",
    ephemeral: true,
  })

  const completion = Promise.withResolvers<JsonObject>()
  turnFinished = completion

  await request("turn/start", {
    threadId: thread.thread.id,
    input: [{ type: "text", text: prompt }],
  })

  await completion.promise
}

try {
  await main()
} catch (error) {
  console.error(getErrorMessage(error))
  process.exitCode = 1
} finally {
  if (!outputEndsWithNewline) process.stdout.write("\n")
  shuttingDown = true
  lines.close()
  server.stdin.end()
  server.kill()
}
