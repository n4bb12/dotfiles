import { expect, describe as group, test } from "bun:test"

import { labelOf, parseTasklist, parseWslconfig } from "./classify.ts"

const HOME = "/home/me"

group("labelOf", () => {
  test("names the tool and the project it runs in", () => {
    const labels = [
      { comm: "node", args: ["node", "/home/me/code/acme/shop/node_modules/.bin/tsc", "--noEmit"] },
      { comm: "node", args: ["node (vitest 3)"] },
      { comm: "next-server (v1", args: ["next-server (v15.2.0)"] },
      {
        comm: "MainThread",
        args: ["/home/me/.cursor-server/bin/abc/node", "/home/me/.cursor-server/bin/abc/out/bootstrap-fork"],
      },
      { comm: "node", args: ["/home/me/.cursor-server/bin/abc/node", "/home/me/.cursor-server/x/tsserver.js"] },
      { comm: "claude", args: ["claude"] },
      { comm: "bun", args: ["bun", "run", "dev"] },
      { comm: "postgres", args: ["postgres"], container: "shop-postgres-1" },
      { comm: "bash", args: ["bash"] },
    ].map((info) => labelOf({ ...info, cwd: "/home/me/code/acme/shop/apps/web" }, HOME))

    expect(labels).toMatchInlineSnapshot(`
      [
        "tsc · shop",
        "vitest · shop",
        "next-server · shop",
        "Cursor server · shop",
        "tsserver · shop",
        "Claude Code · shop",
        "bun run dev · shop",
        "docker shop-postgres-1",
        "bash · shop",
      ]
    `)
  })

  test("leaves out the project outside ~/code", () => {
    expect(labelOf({ comm: "claude", args: ["claude"], cwd: HOME }, HOME)).toMatchInlineSnapshot(`"Claude Code"`)
  })
})

test("parseTasklist reads localized memory sizes", () => {
  const csv = ['"chrome.exe","123","Console","1","110.848 K"', '"Code.exe","456","Console","1","2,048 K"', ""].join(
    "\r\n",
  )

  expect(parseTasklist(csv)).toMatchInlineSnapshot(`
    [
      {
        "mb": 108,
        "name": "chrome",
      },
      {
        "mb": 2,
        "name": "Code",
      },
    ]
  `)
})

test("parseWslconfig keeps settings and drops sections and comments", () => {
  const text = [
    "[wsl2]",
    "memory=24GB",
    "swap = 8GB ; half of RAM",
    "# processors=8",
    "",
    "[experimental]",
    "autoMemoryReclaim=gradual",
  ].join("\r\n")

  expect(parseWslconfig(text)).toMatchInlineSnapshot(`
    {
      "autoMemoryReclaim": "gradual",
      "memory": "24GB",
      "swap": "8GB",
    }
  `)
})
