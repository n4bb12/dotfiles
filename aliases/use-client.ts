import { Glob } from "bun"

const SOURCE_GLOB = "**/*.{ts,tsx}"

const CONCURRENCY = 64

const SKIP_FILE_SUFFIXES = [".types.ts", ".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", "types.ts"]
const CLIENT_FILE_SUFFIXES = [".client.ts", ".client.tsx"] as const
const SERVER_FILE_SUFFIXES = [".server.ts", ".server.tsx"] as const
const SERVER_IMPORTS = ["next/cache", "next/headers", "next/server", "server-only"] as const
const CLIENT_IMPORTS = ["client-only"] as const

const CLIENT_HOOK_PATTERN = /\buse[A-Z]/
const JSX_EVENT_HANDLER_PATTERN = /\bon[A-Z]\w*\s*=/
const ZUSTAND_SELECTOR_PATTERN = /\wStore\s*\(|createStore\s*\(/i
const ZUSTAND_SELECTOR_WITH_STATE_PATTERN = /Store\s*\(\s*\(?\s*state\b/
const CLASS_COMPONENT_PATTERN = /\bextends\s+(?:React\.)?Component\b/
const SSR_FALSE_PATTERN = /\bssr:\s*false\b/
const WINDOW_PATTERN = /\bwindow\s*[.[]/
const DOCUMENT_PATTERN = /\bdocument\s*\./
const LOCAL_STORAGE_PATTERN = /\blocalStorage\b/
const MATCH_MEDIA_PATTERN = /\bmatchMedia\b/
const NAVIGATOR_PATTERN = /\bnavigator\b/
const SESSION_STORAGE_PATTERN = /\bsessionStorage\b/
const CLIENT_API_PATTERNS = [/\bcreateContext\s*[<(]/, /\bforwardRef\s*[<(]/] as const
const COMPONENT_PROP_PATTERN = /\s[A-Z][a-zA-Z0-9]*=\{[A-Z][a-zA-Z0-9]+\}/
const USE_CLIENT_DIRECTIVE = /^\s*["']use client["']\s*;?\s*$/
const USE_SERVER_DIRECTIVE = /["']use server["']/
const MAYBE_CLIENT_PATTERN =
  /\buse[A-Z]\w*|on[A-Z]\w*\s*=|window\s*[.[]|document\s*\.|localStorage|matchMedia|navigator|sessionStorage|createContext\s*[<(]|forwardRef\s*[<(]|\wStore\s*\(|createStore\s*\(|extends\s+(?:React\.)?Component|ssr:\s*false/

function shouldSkipFile(file: string): boolean {
  if (file.includes("/node_modules/")) {
    return true
  }

  if (file.includes("generated")) {
    return true
  }

  const lower = file.toLowerCase()
  return SKIP_FILE_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

function hasClientFileSuffix(file: string): boolean {
  const lower = file.toLowerCase()
  return CLIENT_FILE_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

function hasServerFileSuffix(file: string): boolean {
  const lower = file.toLowerCase()
  return SERVER_FILE_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

function importsClientModule(content: string): boolean {
  let inImport = false

  for (const line of content.split("\n")) {
    const stripped = stripLineForAnalysis(line).trim()

    if (!stripped) {
      continue
    }

    if (stripped.startsWith("import type ")) {
      continue
    }

    if (stripped.startsWith("import ")) {
      inImport = true

      if (/["'][^"']*\.client["']/.test(stripped)) {
        return true
      }

      if (!stripped.includes("{") || stripped.includes("}")) {
        inImport = false
      }

      continue
    }

    if (inImport) {
      if (/["'][^"']*\.client["']/.test(stripped)) {
        return true
      }

      if (stripped.includes("}")) {
        inImport = false
      }
    }
  }

  return false
}

function stripLineForAnalysis(line: string): string {
  return line
    .replace(/\/\/.*$/, "")
    .replace(/\/\*.*?\*\//g, "")
    .trim()
}

function hasUseClientDirective(content: string): boolean {
  let lineStart = 0
  let lineCount = 0

  while (lineCount < 15 && lineStart < content.length) {
    const lineEnd = content.indexOf("\n", lineStart)
    const line = lineEnd === -1 ? content.slice(lineStart) : content.slice(lineStart, lineEnd)

    if (USE_CLIENT_DIRECTIVE.test(line)) {
      return true
    }

    lineCount++

    if (lineEnd === -1) {
      break
    }

    lineStart = lineEnd + 1
  }

  return false
}

function hasUseServerDirective(content: string): boolean {
  return USE_SERVER_DIRECTIVE.test(content)
}

function importsFrom(content: string, modules: readonly string[]): boolean {
  return modules.some((module) => content.includes(`from "${module}"`))
}

function hasHookNameInImportSpecifier(text: string): boolean {
  const braceMatch = text.match(/\{([^}]+)\}/)

  if (!braceMatch) {
    return false
  }

  return !!braceMatch[1]?.split(",").some((spec) => {
    const name =
      spec
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        ?.trim() ?? ""

    return /^use[A-Z]/.test(name) && name !== "useId"
  })
}

function hasHookNameInImportLine(line: string): boolean {
  const defaultMatch = line.match(/^import\s+(use[A-Z]\w*)/)

  if (defaultMatch?.[1] && defaultMatch[1] !== "useId") {
    return true
  }

  return hasHookNameInImportSpecifier(line)
}

function hasBrowserGlobalInLine(line: string): boolean {
  return (
    WINDOW_PATTERN.test(line) ||
    DOCUMENT_PATTERN.test(line) ||
    LOCAL_STORAGE_PATTERN.test(line) ||
    MATCH_MEDIA_PATTERN.test(line) ||
    NAVIGATOR_PATTERN.test(line) ||
    SESSION_STORAGE_PATTERN.test(line)
  )
}

function hasClientApi(code: string): boolean {
  return CLIENT_API_PATTERNS.some((pattern) => pattern.test(code))
}

function hasComponentPropReference(content: string): boolean {
  for (const line of content.split("\n")) {
    const stripped = stripLineForAnalysis(line)

    if (/\w<[A-Z]/.test(stripped)) {
      continue
    }

    if (COMPONENT_PROP_PATTERN.test(stripped)) {
      return true
    }
  }

  return false
}

function analyzeContent(content: string): boolean {
  if (!MAYBE_CLIENT_PATTERN.test(content) && !hasComponentPropReference(content)) {
    return false
  }

  let inImport = false
  const strippedLines: string[] = []

  for (const line of content.split("\n")) {
    const stripped = stripLineForAnalysis(line)

    if (!stripped) {
      continue
    }

    if (stripped.startsWith("import type ")) {
      continue
    }

    if (stripped.startsWith("import ")) {
      inImport = true

      if (hasHookNameInImportLine(stripped)) {
        return true
      }

      if (!stripped.includes("{") || stripped.includes("}")) {
        inImport = false
      }

      continue
    }

    if (inImport) {
      if (hasHookNameInImportSpecifier(stripped) || /^use[A-Z]\w*\s*,?\s*$/.test(stripped)) {
        const name = stripped.replace(/,.*$/, "").trim()

        if (/^use[A-Z]/.test(name) && name !== "useId") {
          return true
        }
      }

      if (stripped.includes("}")) {
        inImport = false
      }

      continue
    }

    if (stripped.startsWith("*")) {
      continue
    }

    if (CLIENT_HOOK_PATTERN.test(stripped) && !stripped.includes("useId")) {
      return true
    }

    if (JSX_EVENT_HANDLER_PATTERN.test(stripped)) {
      return true
    }

    if (/\w<[A-Z]/.test(stripped)) {
      continue
    }

    if (COMPONENT_PROP_PATTERN.test(stripped)) {
      return true
    }

    if (hasBrowserGlobalInLine(stripped)) {
      return true
    }

    strippedLines.push(stripped)
  }

  if (!strippedLines.length) {
    return false
  }

  const code = strippedLines.join("\n")

  return (
    hasClientApi(code) ||
    ZUSTAND_SELECTOR_PATTERN.test(code) ||
    ZUSTAND_SELECTOR_WITH_STATE_PATTERN.test(code) ||
    CLASS_COMPONENT_PATTERN.test(code) ||
    SSR_FALSE_PATTERN.test(code)
  )
}

export function isClientCode(file: string, content: string): boolean {
  if (shouldSkipFile(file)) {
    return false
  }

  if (hasServerFileSuffix(file) || file.includes("/server/")) {
    return false
  }

  if (hasUseServerDirective(content)) {
    return false
  }

  if (importsFrom(content, SERVER_IMPORTS)) {
    return false
  }

  if (hasClientFileSuffix(file) || importsClientModule(content)) {
    return true
  }

  if (importsFrom(content, CLIENT_IMPORTS)) {
    return true
  }

  if (file.endsWith("error.tsx")) {
    return true
  }

  if (content.includes("runOnceInBrowser")) {
    return true
  }

  return analyzeContent(content)
}

function removeUseClientDirective(content: string): string {
  return content.replace(/^\s*["']use client["']\s*;?\s*\n+/, "")
}

function addUseClientDirective(content: string): string {
  return `"use client"\n\n${content}`
}

async function collectSourceFiles(): Promise<string[]> {
  const files: string[] = []
  const glob = new Glob(SOURCE_GLOB)

  for await (const file of glob.scan({ cwd: ".", onlyFiles: true, dot: false })) {
    if (!file.includes("node_modules/")) {
      files.push(file)
    }
  }

  return files
}

async function mapPool<T, R>(items: readonly T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let index = 0

  async function worker() {
    while (true) {
      const current = index++

      if (current >= items.length) {
        return
      }

      const item = items[current]

      if (item === undefined) {
        return
      }

      results[current] = await fn(item)
    }
  }

  const workers = Math.min(concurrency, items.length)

  if (!workers) {
    return results
  }

  await Promise.all(Array.from({ length: workers }, () => worker()))
  return results
}

async function processFile(file: string): Promise<string | null> {
  const content = await Bun.file(file).text()
  const isClient = isClientCode(file, content)
  const hasDirective = hasUseClientDirective(content)

  if (isClient && !hasDirective) {
    await Bun.write(file, addUseClientDirective(content))
    return `Added "use client" to ${file}`
  }

  if (!isClient && hasDirective) {
    await Bun.write(file, removeUseClientDirective(content))
    return `Removed "use client" from ${file}`
  }

  return null
}

if (import.meta.main) {
  const files = await collectSourceFiles()
  const messages = await mapPool(files, CONCURRENCY, processFile)

  for (const message of messages) {
    if (message) {
      console.log(message)
    }
  }
}
