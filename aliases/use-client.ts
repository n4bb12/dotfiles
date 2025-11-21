import { globSync, readFileSync, writeFileSync } from "node:fs"

const files = globSync("src/**/*.{ts,tsx}")

function detectEnvironment(file: string, content: string, lines: string[]): "client" | "server" | "none" {
  if (file.toLowerCase().endsWith("types.ts")) {
    return "none"
  }
  if (file.toLowerCase().endsWith("test.ts")) {
    return "none"
  }

  if (file.startsWith("src/server")) {
    return "server"
  }
  if (content.includes('"use server"')) {
    return "server"
  }
  if (content.includes('from "next/headers"')) {
    return "server"
  }

  if (file.endsWith("error.tsx")) {
    return "client"
  }

  for (const line of lines) {
    if (line.startsWith("//")) {
      continue
    }

    if (/\buse[A-Z].*?[<(]/.test(line) || /Store\(\)/i.test(line) || /Store\(\(state\) =>/i.test(line)) {
      return "client"
    }
    if (file.endsWith(".tsx") && /\bon[A-Z]\w*\b/.test(line)) {
      return "client"
    }
    if (line.includes("ssr: false")) {
      return "client"
    }
  }

  return "server"
}

for (const file of files) {
  const content = readFileSync(file, "utf-8")
  const lines = content.split("\n")

  const environment = detectEnvironment(file, content, lines)

  if (environment === "client") {
    if (!lines.some((line) => line === '"use client"')) {
      // biome-ignore lint/style/useTemplate: <explanation>
      const newContent = '"use client"\n\n' + content
      writeFileSync(file, newContent)
      console.log(`Added "use client" to ${file}`)
    }

    if (lines.some((line) => line === '"use server"')) {
      throw new Error(`"use client" and "use server" cannot coexist in ${file}`)
    }
  } else {
    if (lines.some((line) => line === '"use client"')) {
      const newContent = content.replace('"use client"\n', "")
      writeFileSync(file, newContent)
      console.log(`Removed "use client" from ${file}`)
    }
  }
}
