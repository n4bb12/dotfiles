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
const debug = process.env.OASK_DEBUG === "1"
const finalOnly = process.env.OASK_FINAL_ONLY === "1"
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
let activeTurnId: string | null = null
let resolveTurn: ((value: JsonObject) => void) | null = null
let rejectTurn: ((error: Error) => void) | null = null
let serverError = ""
let wroteOutput = false
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

function completeTurn(turn: JsonObject) {
  if (turn.status === "failed") {
    const error = isObject(turn.error) ? turn.error.message : undefined
    rejectTurn?.(new Error(typeof error === "string" ? error : "Codex turn failed"))
  } else if (turn.status === "interrupted") {
    rejectTurn?.(new Error("Codex turn was interrupted"))
  } else {
    resolveTurn?.(turn)
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
    const { delta, itemId, turnId } = message.params
    if (
      typeof delta === "string" &&
      typeof itemId === "string" &&
      (activeTurnId === null || turnId === activeTurnId) &&
      (!finalOnly || messagePhases.get(itemId) !== "commentary")
    ) {
      process.stdout.write(delta.replaceAll("\r", ""))
      streamedMessageIds.add(itemId)
      wroteOutput = true
      outputEndsWithNewline = delta.endsWith("\n") || delta.endsWith("\r")
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
    if (isObject(turn) && typeof turn.id === "string" && turn.id === activeTurnId) {
      completeTurn(turn)
    }
  }
})

server.on("error", (error) => {
  for (const handler of pending.values()) handler.reject(error)
  pending.clear()
  rejectTurn?.(error)
})

server.on("close", (code) => {
  if (shuttingDown) return
  const details = serverError.trim()
  const error = new Error(details || `Codex App Server exited with status ${code ?? "unknown"}`)
  for (const handler of pending.values()) handler.reject(error)
  pending.clear()
  rejectTurn?.(error)
})

async function main() {
  await request("initialize", {
    clientInfo: {
      name: "oask_app_server",
      title: "oask App Server",
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

  const turnFinished = new Promise<JsonObject>((resolve, reject) => {
    resolveTurn = resolve
    rejectTurn = reject
  })

  const response = await request<{ turn: { id: string } }>("turn/start", {
    threadId: thread.thread.id,
    input: [{ type: "text", text: prompt }],
  })
  activeTurnId = response.turn.id

  await turnFinished
}

try {
  await main()
} catch (error) {
  console.error(getErrorMessage(error))
  process.exitCode = 1
} finally {
  if (wroteOutput && !outputEndsWithNewline) process.stdout.write("\n")
  shuttingDown = true
  lines.close()
  server.stdin.end()
  server.kill()
}
