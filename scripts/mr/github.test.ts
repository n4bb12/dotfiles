import { describe, expect, test } from "bun:test"

import { assertAttachmentLimit, githubBodyFile, githubCreateArgv, githubUpdateArgv } from "./github.ts"
import { MAX_GITHUB_ATTACHMENTS, MrError } from "./types.ts"

describe("github argv", () => {
  test("create attaches each local image and sets head to skip push", () => {
    expect(
      githubCreateArgv({
        title: "Improve checkout",
        baseBranch: "main",
        headBranch: "feat/checkout",
        bodyFile: "description.publish.md",
        attachments: ["screenshots/01-before.png", "screenshots/01-after.png"],
      }),
    ).toMatchInlineSnapshot(`
      [
        "gh",
        "pr",
        "create",
        "--title",
        "Improve checkout",
        "--body-file",
        "description.publish.md",
        "--base",
        "main",
        "--head",
        "feat/checkout",
        "--attach",
        "screenshots/01-before.png",
        "--attach",
        "screenshots/01-after.png",
      ]
    `)
  })

  test("update attaches images for the current pr", () => {
    expect(
      githubUpdateArgv({
        iid: "12",
        bodyFile: "description.publish.md",
        attachments: ["screenshots/01-before.png"],
      }),
    ).toMatchInlineSnapshot(`
      [
        "gh",
        "pr",
        "edit",
        "12",
        "--body-file",
        "description.publish.md",
        "--attach",
        "screenshots/01-before.png",
      ]
    `)
  })

  test("rejects more than 50 attachments", () => {
    const attachments = Array.from({ length: MAX_GITHUB_ATTACHMENTS + 1 }, (_, i) => `screenshots/${i}.png`)

    expect(() => assertAttachmentLimit(attachments)).toThrow(MrError)
  })

  test("uses a body path relative to .mr", () => {
    expect(githubBodyFile("/tmp/repo/.mr", "/tmp/repo/.mr/description.publish.md")).toBe("description.publish.md")
    expect(githubBodyFile("/tmp/repo/.mr", "description.publish.md")).toBe("description.publish.md")
  })
})
