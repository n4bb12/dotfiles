import { globSync, readFileSync, writeFileSync } from "node:fs"

const SOURCE_GLOB = "**/src/**/*.{ts,tsx}"

const SKIP_FILE_SUFFIXES = [".types.ts", ".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", "types.ts"]

const SERVER_IMPORTS = ["next/cache", "next/headers", "next/server", "server-only"] as const

const CLIENT_IMPORTS = ["client-only"] as const

const CLIENT_HOOK_PATTERN = /\buse[A-Z].*?[<(]/
const JSX_EVENT_HANDLER_PATTERN = /\bon[A-Z]\w*\s*=/
const ZUSTAND_SELECTOR_PATTERN = /Store\(\)/i
const ZUSTAND_SELECTOR_WITH_STATE_PATTERN = /Store\(\(state\)/
const CLASS_COMPONENT_PATTERN = /\bextends\s+(?:React\.)?Component\b/
const SSR_FALSE_PATTERN = /\bssr:\s*false\b/
const WINDOW_PATTERN = /\bwindow\s*[.[]/
const DOCUMENT_PATTERN = /\bdocument\s*\./
const LOCAL_STORAGE_PATTERN = /\blocalStorage\b/
const MATCH_MEDIA_PATTERN = /\bmatchMedia\b/
const NAVIGATOR_PATTERN = /\bnavigator\b/
const SESSION_STORAGE_PATTERN = /\bsessionStorage\b/

const CLIENT_API_PATTERNS = [/\bcreateContext\s*[<(]/, /\bforwardRef\s*[<(]/] as const

const USE_CLIENT_DIRECTIVE = /^\s*["']use client["']\s*;?\s*$/
const USE_SERVER_DIRECTIVE = /["']use server["']/

function shouldSkipFile(file: string): boolean {
  if (file.includes("generated")) {
    return true
  }

  const lower = file.toLowerCase()
  return SKIP_FILE_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

function stripLineForAnalysis(line: string): string {
  return line
    .replace(/\/\/.*$/, "")
    .replace(/\/\*.*?\*\//g, "")
    .trim()
}

function hasUseClientDirective(lines: string[]): boolean {
  return lines.some((line) => USE_CLIENT_DIRECTIVE.test(line))
}

function hasUseServerDirective(content: string): boolean {
  return USE_SERVER_DIRECTIVE.test(content)
}

function importsFrom(content: string, modules: readonly string[]): boolean {
  return modules.some((module) => content.includes(`from "${module}"`))
}

function hasBrowserGlobal(code: string): boolean {
  return (
    WINDOW_PATTERN.test(code) ||
    DOCUMENT_PATTERN.test(code) ||
    LOCAL_STORAGE_PATTERN.test(code) ||
    MATCH_MEDIA_PATTERN.test(code) ||
    NAVIGATOR_PATTERN.test(code) ||
    SESSION_STORAGE_PATTERN.test(code)
  )
}

function hasClientApi(code: string): boolean {
  return CLIENT_API_PATTERNS.some((pattern) => pattern.test(code))
}

function analyzeLines(lines: string[]): boolean {
  const strippedLines: string[] = []

  for (const line of lines) {
    const stripped = stripLineForAnalysis(line)
    if (!stripped || stripped.startsWith("*")) {
      continue
    }

    if (CLIENT_HOOK_PATTERN.test(stripped) && !stripped.includes("useId")) {
      return true
    }

    if (JSX_EVENT_HANDLER_PATTERN.test(stripped)) {
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
    hasBrowserGlobal(code) ||
    ZUSTAND_SELECTOR_PATTERN.test(code) ||
    ZUSTAND_SELECTOR_WITH_STATE_PATTERN.test(code) ||
    CLASS_COMPONENT_PATTERN.test(code) ||
    SSR_FALSE_PATTERN.test(code)
  )
}

export function isClientCode(file: string, content: string, lines: string[]): boolean {
  if (shouldSkipFile(file)) {
    return false
  }

  if (file.includes("/server/")) {
    return false
  }

  if (hasUseServerDirective(content)) {
    return false
  }

  if (importsFrom(content, SERVER_IMPORTS)) {
    return false
  }

  if (importsFrom(content, CLIENT_IMPORTS)) {
    return true
  }

  if (file.endsWith("error.tsx")) {
    return true
  }

  return analyzeLines(lines)
}

function removeUseClientDirective(content: string): string {
  return content.replace(/^\s*["']use client["']\s*;?\s*\n+/, "")
}

function addUseClientDirective(content: string): string {
  return `"use client"\n\n${content}`
}

if (import.meta.main) {
  const files = globSync(SOURCE_GLOB)

  for (const file of files) {
    const content = readFileSync(file, "utf-8")
    const lines = content.split("\n")

    if (!file.endsWith(".tsx")) {
      if (hasUseClientDirective(lines)) {
        writeFileSync(file, removeUseClientDirective(content))
        console.log(`Removed "use client" from ${file}`)
      }

      continue
    }

    if (isClientCode(file, content, lines)) {
      if (!hasUseClientDirective(lines)) {
        writeFileSync(file, addUseClientDirective(content))
        console.log(`Added "use client" to ${file}`)
      }
    } else if (hasUseClientDirective(lines)) {
      writeFileSync(file, removeUseClientDirective(content))
      console.log(`Removed "use client" from ${file}`)
    }
  }
}
