import { describe, expect, test } from "bun:test"
import { join } from "node:path"

import { findImageRefs, isRemoteDestination, replaceLocalImageDestinations, resolveImageRefs } from "./markdown.ts"

describe("markdown image refs", () => {
  test("finds local before/after images and leaves host urls alone", () => {
    const markdown = `
| Before | After |
| --- | --- |
| ![Before](./screenshots/01-before.png) | ![After](./screenshots/01-after.png) |

![remote](https://example.com/a.png)
![gitlab](/uploads/abc/01-before.png)
![abs](</screenshots/my file.png>)
`

    expect(findImageRefs(markdown).map((ref) => [ref.kind, ref.dest])).toMatchInlineSnapshot(`
      [
        [
          "local",
          "./screenshots/01-before.png",
        ],
        [
          "local",
          "./screenshots/01-after.png",
        ],
        [
          "remote",
          "https://example.com/a.png",
        ],
        [
          "remote",
          "/uploads/abc/01-before.png",
        ],
        [
          "local",
          "/screenshots/my file.png",
        ],
      ]
    `)
  })

  test("treats https and upload paths as remote", () => {
    expect(isRemoteDestination("https://github.com/a.png")).toBe(true)
    expect(isRemoteDestination("/uploads/x/y.png")).toBe(true)
    expect(isRemoteDestination("./screenshots/01-before.png")).toBe(false)
  })

  test("resolves attach paths relative to .mr", () => {
    const refs = resolveImageRefs("![Before](./screenshots/01-before.png)", "/tmp/repo/.mr")
    const first = refs[0]

    expect(first?.attachPath).toBe("screenshots/01-before.png")
    expect(first?.absPath).toBe(join("/tmp/repo/.mr", "./screenshots/01-before.png"))
  })

  test("replaces local destinations and keeps remote ones", () => {
    const markdown =
      "![Before](./screenshots/01-before.png) ![remote](https://example.com/a.png) ![After](./screenshots/01-after.png)"
    const replacements = new Map([
      ["./screenshots/01-before.png", "/uploads/aaa/01-before.png"],
      ["./screenshots/01-after.png", "/uploads/bbb/01-after.png"],
    ])

    expect(replaceLocalImageDestinations(markdown, replacements)).toMatchInlineSnapshot(
      `"![Before](/uploads/aaa/01-before.png) ![remote](https://example.com/a.png) ![After](/uploads/bbb/01-after.png)"`,
    )
  })
})
