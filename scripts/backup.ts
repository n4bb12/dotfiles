import { copyFile, mkdir, readdir, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { basename, dirname, join, relative, resolve } from "node:path"

import { $ } from "bun"

const DEFAULT_SOURCE_ROOT = join(homedir(), "code")
const DEFAULT_BACKUP_ROOT = join(homedir(), "backup")

const SKIP_DIR_NAMES = new Set([
  ".cache",
  ".git",
  ".next",
  ".nitro",
  ".nuxt",
  ".nx",
  ".output",
  ".parcel-cache",
  ".svelte-kit",
  ".turbo",
  ".vercel",
  ".vinxi",
  ".vite",
  "build",
  "coverage",
  "dist",
  "node_modules",
])

const SECRET_DIR_NAMES = new Set(["data", "notes", "secrets"])

function isEnvFileName(name: string) {
  return name.startsWith(".env")
}

function isSecretDirName(name: string) {
  return SECRET_DIR_NAMES.has(name)
}

function shouldSkipDirName(name: string) {
  return SKIP_DIR_NAMES.has(name)
}

function backupDirName(date = new Date()) {
  return `code-${date
    .toISOString()
    .replaceAll(":", "-")
    .replace(/\.\d{3}Z$/, "Z")}`
}

export async function collectBackupPaths(root: string) {
  const absRoot = resolve(root)
  const paths: string[] = []

  await walk(absRoot, paths)

  paths.sort((a, b) => a.localeCompare(b))

  return paths
}

export async function backup(options: { destDir?: string; root?: string } = {}) {
  const root = resolve(options.root ?? DEFAULT_SOURCE_ROOT)
  const destDir = resolve(options.destDir ?? DEFAULT_BACKUP_ROOT)
  const rootStat = await stat(root).catch(() => null)

  if (!rootStat?.isDirectory()) {
    throw new Error(`Source directory does not exist: ${root}`)
  }

  const paths = await collectBackupPaths(root)

  if (!paths.length) {
    return { dir: undefined, paths }
  }

  const dir = join(destDir, backupDirName())

  await mkdir(dir, { recursive: true })

  for (const path of paths) {
    const dest = join(dir, relative(root, path))
    await mkdir(dirname(dest), { recursive: true })
    await copyFile(path, dest)
  }

  return { dir, paths }
}

async function walk(dir: string, paths: string[]) {
  if (await isGitRoot(dir)) {
    for (const path of await listIgnoredFiles(dir)) {
      if (shouldBackupIgnoredPath(dir, path)) {
        paths.push(path)
      }
    }
  }

  const entries = await readdir(dir, { withFileTypes: true }).catch(() => undefined)

  if (!entries) {
    return
  }

  for (const entry of entries) {
    if (entry.isSymbolicLink() || !entry.isDirectory() || shouldSkipDirName(entry.name)) {
      continue
    }

    await walk(join(dir, entry.name), paths)
  }
}

function shouldBackupIgnoredPath(repoRoot: string, path: string) {
  const parts = relative(repoRoot, path).split(/[/\\]/)

  if (parts.some((part) => SKIP_DIR_NAMES.has(part))) {
    return false
  }

  return isEnvFileName(basename(path)) || parts.some((part) => isSecretDirName(part))
}

async function isGitRoot(dir: string) {
  try {
    await stat(join(dir, ".git"))
    return true
  } catch {
    return false
  }
}

async function listIgnoredFiles(repoRoot: string) {
  const result = await $`git -C ${repoRoot} ls-files -z --others --ignored --exclude-standard`.quiet().nothrow()

  if (result.exitCode !== 0) {
    return []
  }

  const paths: string[] = []

  for (const rel of result.stdout.toString().split("\0")) {
    if (!rel) {
      continue
    }

    paths.push(join(repoRoot, rel))
  }

  return paths
}

if (import.meta.main) {
  try {
    const result = await backup()
    const root = resolve(DEFAULT_SOURCE_ROOT)

    if (!result.paths.length) {
      console.log(`No gitignored env files or secret folders found in ${root}`)
      process.exit(0)
    }

    for (const path of result.paths) {
      console.log(relative(root, path))
    }

    console.log()
    console.log(`Wrote ${result.paths.length} files to ${result.dir}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
