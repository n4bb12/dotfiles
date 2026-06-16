import { globSync, readFileSync, writeFileSync } from "node:fs"

const SOURCE_GLOB = "**/src/**/*.{ts,tsx}"

const SKIP_FILE_SUFFIXES = [".types.ts", ".test.ts", ".spec.ts", "types.ts"]

const SERVER_IMPORTS = ["next/cache", "next/headers", "next/server", "server-only"] as const

const CLIENT_IMPORTS = ["client-only"] as const

const CLIENT_HOOKS = [
  "useActionState",
  "useCallback",
  "useContext",
  "useDebugValue",
  "useDeferredValue",
  "useEffect",
  "useFormStatus",
  "useImperativeHandle",
  "useInsertionEffect",
  "useLayoutEffect",
  "useMemo",
  "useOptimistic",
  "useParams",
  "usePathname",
  "useReducer",
  "useRef",
  "useRouter",
  "useSearchParams",
  "useSelectedLayoutSegment",
  "useSelectedLayoutSegments",
  "useState",
  "useSyncExternalStore",
  "useTransition",
] as const

const CLIENT_APIS = ["createContext", "forwardRef"] as const

const BROWSER_GLOBALS = ["document", "localStorage", "matchMedia", "navigator", "sessionStorage", "window"] as const

const USE_CLIENT_DIRECTIVE = /^\s*["']use client["']\s*;?\s*$/
const USE_SERVER_DIRECTIVE = /["']use server["']/

function shouldSkipFile(file: string): boolean {
  const lower = file.toLowerCase()

  if (lower.includes("generated")) {
    return true
  }

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

function hasClientHook(code: string): boolean {
  return CLIENT_HOOKS.some((hook) => new RegExp(`\\b${hook}\\s*[<(]`).test(code))
}

function hasClientApi(code: string): boolean {
  return CLIENT_APIS.some((api) => new RegExp(`\\b${api}\\s*[<(]`).test(code))
}

function hasBrowserGlobal(code: string): boolean {
  return BROWSER_GLOBALS.some((global) => {
    if (global === "window") {
      return /\bwindow\s*[.[]/.test(code)
    }

    return new RegExp(`\\b${global}\\b`).test(code)
  })
}

function hasJsxEventHandler(code: string): boolean {
  return /\bon[A-Z]\w*\s*=/.test(code)
}

function hasZustandSelector(code: string): boolean {
  return /Store\(\)/i.test(code) || /Store\(\(state\)/i.test(code)
}

function hasClassComponent(code: string): boolean {
  return /\bextends\s+(?:React\.)?Component\b/.test(code)
}

function hasClientOnlyDynamicImport(code: string): boolean {
  return /\bssr:\s*false\b/.test(code)
}

function analyzeCode(code: string): boolean {
  return (
    hasClientHook(code) ||
    hasClientApi(code) ||
    hasBrowserGlobal(code) ||
    hasJsxEventHandler(code) ||
    hasZustandSelector(code) ||
    hasClassComponent(code) ||
    hasClientOnlyDynamicImport(code)
  )
}

export function isClientCode(file: string, content: string, lines: string[]): boolean {
  if (shouldSkipFile(file)) {
    return false
  }

  const isComponentFile = file.endsWith(".tsx") || file.endsWith(".ts")
  if (!isComponentFile) {
    return false
  }

  if (file.includes("/server/")) {
    return false
  }

  if (file.endsWith("error.tsx")) {
    return true
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

  const analyzed = lines
    .map(stripLineForAnalysis)
    .filter((line) => line.length > 0 && !line.startsWith("*"))
    .join("\n")

  if (analyzeCode(analyzed)) {
    return true
  }

  return false
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

    if (isClientCode(file, content, lines)) {
      if (hasUseServerDirective(content)) {
        throw new Error(`"use client" and "use server" cannot coexist in ${file}`)
      }

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
