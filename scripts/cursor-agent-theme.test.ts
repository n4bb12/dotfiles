import { Database } from "bun:sqlite"
import { describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  applyCursorAgentTheme,
  CursorAgentThemeError,
  cursorUserDir,
  glassThemeRecord,
  isCursorDesktopCommand,
  withoutGlassWindowBorder,
} from "./cursor-agent-theme"

function itemRow(row: unknown) {
  if (typeof row !== "object" || row === null || !("key" in row) || !("value" in row)) {
    return []
  }

  if (typeof row.key !== "string") {
    return []
  }

  const value =
    typeof row.value === "string"
      ? row.value
      : row.value instanceof Uint8Array
        ? new TextDecoder().decode(row.value)
        : undefined

  if (typeof value !== "string") {
    return []
  }

  return [{ key: row.key, value }]
}

describe("cursorUserDir", () => {
  test("uses the platform config directory", () => {
    expect(cursorUserDir("linux", "/home/abraham")).toMatchInlineSnapshot(`"/home/abraham/.config/Cursor/User"`)
    expect(cursorUserDir("darwin", "/Users/abraham")).toMatchInlineSnapshot(
      `"/Users/abraham/Library/Application Support/Cursor/User"`,
    )
    expect(cursorUserDir("win32", "/home/abraham", "C:\\Users\\abraham\\AppData\\Roaming")).toMatchInlineSnapshot(
      `"C:\\Users\\abraham\\AppData\\Roaming\\Cursor\\User"`,
    )
  })
})

describe("isCursorDesktopCommand", () => {
  test("matches the desktop app and ignores the agent cli", () => {
    expect(isCursorDesktopCommand("/usr/share/cursor/cursor .")).toBe(true)
    expect(isCursorDesktopCommand("/usr/share/cursor/cursor --type=renderer")).toBe(true)
    expect(isCursorDesktopCommand("/Applications/Cursor.app/Contents/MacOS/Cursor")).toBe(true)
    expect(isCursorDesktopCommand("C:\\Users\\abraham\\AppData\\Local\\Programs\\cursor\\Cursor.exe")).toBe(true)
    expect(isCursorDesktopCommand("/home/abraham/.local/bin/cursor-agent --use-system-ca")).toBe(false)
  })
})

describe("withoutGlassWindowBorder", () => {
  test("drops the linux and windows inset outline and leaves a second pass unchanged", () => {
    const css =
      ".keep{color:red}[data-component=root][data-system=linux]:not([data-fullscreen=true]):after,[data-component=root][data-system=windows]:not([data-fullscreen=true]):after{box-shadow:inset 0 0 0 1px var(--glass-window-border-color)}.after{color:blue}"

    const once = withoutGlassWindowBorder(css)

    expect(once).toContain("box-shadow:none")
    expect(once).not.toContain("--glass-window-border-color)}")
    expect(withoutGlassWindowBorder(once)).toBe(once)
  })
})

describe("glassThemeRecord", () => {
  test("keeps the menu bar and file area lighter than the sidebar", () => {
    const definition = glassThemeRecord(10, 4).definition

    expect(definition.chrome).toBe(definition.editor)
    expect(definition.sidebar).not.toBe(definition.editor)
    expect({
      chrome: definition.chrome,
      editor: definition.editor,
      sidebar: definition.sidebar,
    }).toMatchInlineSnapshot(`
      {
        "chrome": "#0d1117",
        "editor": "#0d1117",
        "sidebar": "#010409",
      }
    `)
  })
})

describe("applyCursorAgentTheme", () => {
  test("writes the dark slot and leaves unrelated state alone", async () => {
    const userDir = await mkdtemp(join(tmpdir(), "cursor-agent-theme-"))

    try {
      const globalStorage = join(userDir, "globalStorage")

      await mkdir(globalStorage, { recursive: true })

      const database = new Database(join(globalStorage, "state.vscdb"), { create: true })

      database.exec("CREATE TABLE ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB)")
      database.query("INSERT INTO ItemTable (key, value) VALUES (?, ?)").run("kept", "yes")
      database.close()

      await Bun.write(
        join(globalStorage, "storage.json"),
        `${JSON.stringify({ theme: "vs-dark", glassSplash: { baseTheme: "vs-dark", background: "#181818" } }, null, 4)}\n`,
      )

      await expect(
        applyCursorAgentTheme({
          userDir,
          commands: ["/usr/share/cursor/cursor ."],
          now: 20,
        }),
      ).rejects.toBeInstanceOf(CursorAgentThemeError)

      const applied = await applyCursorAgentTheme({
        userDir,
        commands: ["/home/abraham/.local/bin/cursor-agent"],
        now: 20,
      })

      const written = new Database(join(globalStorage, "state.vscdb"), { readonly: true })
      const rows = written.query("SELECT key, value FROM ItemTable ORDER BY key").all().flatMap(itemRow)

      written.close()

      const storage = JSON.parse(await Bun.file(join(globalStorage, "storage.json")).text()) as {
        theme: string
        glassSplash: { background: string }
      }

      expect(rows.find((row) => row.key === "kept")?.value).toBe("yes")
      expect(rows.find((row) => row.key === "glass.theme.darkSettingsId")?.value).toBe(
        "cursor-custom-theme:github-dark",
      )
      expect(storage.theme).toBe("vs-dark")
      expect(storage.glassSplash.background).toBe("#0d1117")
      expect(applied.backupDir).toContain("dotfiles-backup-")
    } finally {
      await rm(userDir, { recursive: true, force: true })
    }
  })
})
