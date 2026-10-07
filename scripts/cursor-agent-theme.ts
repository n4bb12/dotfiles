import { Database } from "bun:sqlite"
import { copyFile, mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join, win32 } from "node:path"

const THEME_ID = "github-dark"
const SETTINGS_ID = `cursor-custom-theme:${THEME_ID}`
const FILE_AREA = "#0d1117"
const SIDEBAR = "#010409"

const GLASS_COLORS = {
  sidebar: SIDEBAR,
  chrome: FILE_AREA,
  editor: FILE_AREA,
  base: "#e6edf3",
  accent: "#238636",
  actionLabel: "#ffffff",
  focus: "#1f6feb",
  success: "#3fb950",
  danger: "#f85149",
  added: "#3fb950",
  modified: "#d29922",
  removed: "#f85149",
  untracked: "#3fb950",
  terminalAnsiBlack: "#484f58",
  terminalAnsiRed: "#ff7b72",
  terminalAnsiYellow: "#d29922",
  terminalAnsiGreen: "#3fb950",
  terminalAnsiCyan: "#39c5cf",
  terminalAnsiBlue: "#58a6ff",
  terminalAnsiMagenta: "#bc8cff",
  terminalAnsiWhite: "#b1bac4",
  terminalAnsiBrightBlack: "#6e7681",
  terminalAnsiBrightRed: "#ffa198",
  terminalAnsiBrightYellow: "#e3b341",
  terminalAnsiBrightGreen: "#56d364",
  terminalAnsiBrightCyan: "#56d4dd",
  terminalAnsiBrightBlue: "#79c0ff",
  terminalAnsiBrightMagenta: "#d2a8ff",
  terminalAnsiBrightWhite: "#ffffff",
  cyan: "#39c5cf",
  blue: "#58a6ff",
  magenta: "#bc8cff",
  diffAddedLineBackground: "#23863626",
  diffAddedTextBackground: "#3fb9504d",
  diffRemovedLineBackground: "#da363326",
  diffRemovedTextBackground: "#ff7b724d",
} as const

export class CursorAgentThemeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CursorAgentThemeError"
  }
}

export function cursorUserDir(platform = process.platform, home = homedir(), appData = process.env.APPDATA) {
  if (platform === "darwin") {
    return join(home, "Library", "Application Support", "Cursor", "User")
  }

  if (platform === "win32") {
    if (!appData) {
      throw new CursorAgentThemeError("APPDATA is unset, so the Cursor user directory is unknown.")
    }

    return win32.join(appData, "Cursor", "User")
  }

  return join(home, ".config", "Cursor", "User")
}

export function isCursorDesktopCommand(command: string) {
  return (
    command.includes("/usr/share/cursor/cursor") ||
    command.includes("/Cursor.app/Contents/MacOS/Cursor") ||
    /[/\\]Cursor\.exe(?:\s|$)/.test(command)
  )
}

export function glassThemeRecord(now = Date.now(), createdAt = now) {
  return {
    id: THEME_ID,
    name: "GitHub Dark",
    source: "vscode",
    bucket: "dark",
    definition: {
      name: "GitHub Dark",
      appearance: "dark",
      highContrast: false,
      ...GLASS_COLORS,
    },
    vscodeThemeSettingsId: "GitHub Dark Default",
    createdAt,
    updatedAt: now,
  }
}

type StoredThemes = {
  _v?: number
  themes?: Record<string, { createdAt?: number }>
}

export function glassThemeState(existing: string | undefined, now = Date.now()) {
  const parsed = parseStoredThemes(existing)
  const previous = parsed.themes?.[THEME_ID]
  const record = glassThemeRecord(now, previous?.createdAt ?? now)

  return JSON.stringify({
    _v: 1,
    themes: {
      ...parsed.themes,
      [THEME_ID]: record,
    },
  })
}

export async function applyCursorAgentTheme(options: { userDir: string; commands: string[]; now?: number }) {
  if (options.commands.some(isCursorDesktopCommand)) {
    throw new CursorAgentThemeError(
      "Quit Cursor completely, then run this again. A running Cursor rewrites this state on exit.",
    )
  }

  const globalStorage = join(options.userDir, "globalStorage")
  const databasePath = join(globalStorage, "state.vscdb")
  const storagePath = join(globalStorage, "storage.json")
  const databaseFile = Bun.file(databasePath)
  const storageFile = Bun.file(storagePath)

  if (!(await databaseFile.exists()) || !(await storageFile.exists())) {
    throw new CursorAgentThemeError(
      `Cursor state was not found in ${globalStorage}. Open Cursor once, quit it, then run this again.`,
    )
  }

  const stamp = new Date(options.now ?? Date.now()).toISOString().replaceAll(":", "-")
  const backupDir = join(globalStorage, `dotfiles-backup-${stamp}`)

  await mkdir(backupDir, { recursive: true })
  await copyFile(databasePath, join(backupDir, "state.vscdb"))
  await copyFile(storagePath, join(backupDir, "storage.json"))

  const database = new Database(databasePath)

  try {
    const row = database.query("SELECT value FROM ItemTable WHERE key = ?").get("glass.theme.customThemesV1")
    const themeState = glassThemeState(sqliteText(rowValue(row)), options.now)

    database.exec("BEGIN IMMEDIATE")

    try {
      replaceItem(database, "glass.theme.customThemesV1", themeState)
      replaceItem(database, "glass.theme.settingsId", SETTINGS_ID)
      replaceItem(database, "glass.theme.darkSettingsId", SETTINGS_ID)
      database.exec("COMMIT")
    } catch (error) {
      database.exec("ROLLBACK")
      throw error
    }
  } finally {
    database.close()
  }

  const storage = JSON.parse(await storageFile.text()) as Record<string, unknown>
  const splash = storage.glassSplash
  const nextSplash = typeof splash === "object" && splash !== null ? { ...splash } : { baseTheme: "vs-dark" }

  storage["glass.theme.settingsId"] = SETTINGS_ID
  storage.glassSplash = { ...nextSplash, background: FILE_AREA, baseTheme: "vs-dark" }

  await Bun.write(storagePath, `${JSON.stringify(storage, null, 4)}\n`)

  return { backupDir, fileArea: FILE_AREA, sidebar: SIDEBAR }
}

function parseStoredThemes(existing: string | undefined): StoredThemes {
  if (!existing) {
    return {}
  }

  try {
    const parsed = JSON.parse(existing) as unknown

    if (typeof parsed !== "object" || parsed === null) {
      return {}
    }

    return parsed as StoredThemes
  } catch {
    return {}
  }
}

function replaceItem(database: Database, key: string, value: string) {
  database.query("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)").run(key, value)
}

function rowValue(row: unknown) {
  if (typeof row !== "object" || row === null || !("value" in row)) {
    return undefined
  }

  return row.value
}

function sqliteText(value: unknown) {
  if (typeof value === "string") {
    return value
  }

  if (value instanceof Uint8Array) {
    return new TextDecoder().decode(value)
  }

  return undefined
}

async function listProcessCommands() {
  if (process.platform === "linux") {
    const proc = new Bun.Glob("*")
    const commands: string[] = []

    for await (const entry of proc.scan({ cwd: "/proc", onlyFiles: false })) {
      if (!/^\d+$/.test(entry)) {
        continue
      }

      try {
        const command = (await Bun.file(join("/proc", entry, "cmdline")).text()).replaceAll("\0", " ").trim()

        if (command) {
          commands.push(command)
        }
      } catch {}
    }

    return commands
  }

  const proc = Bun.spawn(["ps", "-ax", "-o", "command="], { stdout: "pipe" })
  const stdout = await new Response(proc.stdout).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    throw new CursorAgentThemeError("Could not list processes, so it is unsafe to write Cursor state.")
  }

  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

if (import.meta.main) {
  try {
    const applied = await applyCursorAgentTheme({
      userDir: cursorUserDir(),
      commands: await listProcessCommands(),
    })

    console.log(`Agent surfaces: file area and menu bar ${applied.fileArea}, sidebar ${applied.sidebar}`)
    console.log(`Backup: ${applied.backupDir}`)
    console.log("Start Cursor to load it.")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error(message)
    process.exitCode = 1
  }
}
