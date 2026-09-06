import { join } from "node:path"

import { mrPaths } from "./git.ts"
import { GENERATED_END, GENERATED_START, type MrConfig, MrError, type UploadCache, WORKSPACE_DIR } from "./types.ts"

export async function pathExists(path: string) {
  return Bun.file(path).exists()
}

export async function readText(path: string) {
  return Bun.file(path).text()
}

export async function writeText(path: string, content: string) {
  await Bun.write(path, content)
}

export async function ensureDir(path: string) {
  await Bun.$`mkdir -p ${path}`.quiet()
}

export function parseConfig(text: string): MrConfig {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new MrError(
      `${WORKSPACE_DIR}/config.json is not valid JSON. Fix it or delete ${WORKSPACE_DIR}/ and run mr init.`,
    )
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new MrError(`${WORKSPACE_DIR}/config.json must be an object with baseBranch.`)
  }

  const record = objectRecord(parsed)
  const baseBranch = record.baseBranch

  if (typeof baseBranch !== "string" || !baseBranch.trim()) {
    throw new MrError(`${WORKSPACE_DIR}/config.json is missing baseBranch. Run mr init --base <branch>.`)
  }

  return {
    baseBranch: baseBranch.trim(),
    title: stringField(record.title),
    lastPublishedHash: stringField(record.lastPublishedHash),
    lastPublishedIid: stringField(record.lastPublishedIid),
  }
}

export async function readConfig(path: string) {
  if (!(await pathExists(path))) {
    throw new MrError(`No ${WORKSPACE_DIR}/config.json. Run mr init first.`)
  }

  return parseConfig(await readText(path))
}

export async function writeConfig(path: string, config: MrConfig) {
  await writeText(`${path}`, `${JSON.stringify(config, null, 2)}\n`)
}

export async function readUploadCache(path: string): Promise<UploadCache> {
  if (!(await pathExists(path))) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(await readText(path))

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    const cache: UploadCache = {}

    for (const [key, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue
      }

      const record = objectRecord(value)
      const hash = record.hash
      const markdown = record.markdown
      const url = record.url

      if (typeof hash !== "string" || typeof markdown !== "string") {
        continue
      }

      cache[key] = {
        hash,
        markdown,
        url: typeof url === "string" ? url : "",
      }
    }

    return cache
  } catch {
    return {}
  }
}

export async function writeUploadCache(path: string, cache: UploadCache) {
  await writeText(path, `${JSON.stringify(cache, null, 2)}\n`)
}

export async function ensureIgnoreLine(file: string, line: string) {
  let text = ""

  if (await pathExists(file)) {
    text = await readText(file)
  } else {
    await ensureDir(join(file, ".."))
  }

  const lines = text.split(/\r?\n/)

  if (lines.some((entry) => entry.trim() === line)) {
    return false
  }

  const prefix = text.length && !text.endsWith("\n") ? "\n" : ""
  const note = text.includes("mr workflow") ? "" : "# mr workflow (local)\n"

  await writeText(file, `${text}${prefix}${note}${line}\n`)

  return true
}

export async function ensureWorkspaceDirs(repoRoot: string) {
  const paths = mrPaths(repoRoot)

  await ensureDir(paths.mrDir)
  await ensureDir(paths.screenshots)
  await ensureDir(paths.context)
  await ensureDir(paths.gitInfo)
  await ensureIgnoreLine(paths.exclude, `${WORKSPACE_DIR}/`)

  return paths
}

export function wrapGenerated(body: string) {
  const trimmed = body.trim()

  if (trimmed.includes(GENERATED_START) && trimmed.includes(GENERATED_END)) {
    return `${trimmed}\n`
  }

  return `${GENERATED_START}\n\n${trimmed}\n\n${GENERATED_END}\n`
}

export function extractGenerated(markdown: string) {
  const start = markdown.indexOf(GENERATED_START)
  const end = markdown.indexOf(GENERATED_END)

  if (start === -1 || end === -1 || end < start) {
    return {
      prefix: "",
      generated: markdown,
      suffix: "",
      hasMarkers: false,
    }
  }

  return {
    prefix: markdown.slice(0, start),
    generated: markdown.slice(start + GENERATED_START.length, end).trim(),
    suffix: markdown.slice(end + GENERATED_END.length),
    hasMarkers: true,
  }
}

export function spliceGenerated(remote: string, generated: string) {
  const parts = extractGenerated(remote)

  if (!parts.hasMarkers) {
    return undefined
  }

  return `${parts.prefix}${GENERATED_START}\n\n${generated.trim()}\n\n${GENERATED_END}${parts.suffix}`
}

export function hashText(text: string) {
  const hasher = new Bun.CryptoHasher("sha256")

  hasher.update(text)

  return hasher.digest("hex")
}

export async function hashFile(path: string) {
  const hasher = new Bun.CryptoHasher("sha256")

  hasher.update(await Bun.file(path).arrayBuffer())

  return hasher.digest("hex")
}

function objectRecord(value: object) {
  return value as Record<string, unknown>
}

function stringField(value: unknown) {
  if (typeof value !== "string" || !value) {
    return undefined
  }

  return value
}
