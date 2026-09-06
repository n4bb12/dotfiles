import { afterEach, describe, expect, test } from "bun:test"
import { join } from "node:path"

import { parseGitlabUploadResponse, renderGitlabMarkdown } from "./gitlab.ts"
import { MrError } from "./types.ts"

const dirs: string[] = []

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    await Bun.$`rm -rf ${dir}`.nothrow().quiet()
  }
})

describe("gitlab upload parsing", () => {
  test("requires the markdown field", () => {
    expect(
      parseGitlabUploadResponse(
        `{"url":"/uploads/a/01-before.png","markdown":"![01-before](/uploads/a/01-before.png)"}`,
      ),
    ).toMatchInlineSnapshot(`
      {
        "markdown": "![01-before](/uploads/a/01-before.png)",
        "url": "/uploads/a/01-before.png",
      }
    `)

    expect(() => parseGitlabUploadResponse(`{"url":"/uploads/a/01-before.png"}`)).toThrow(MrError)
    expect(() => parseGitlabUploadResponse("not json")).toThrow(MrError)
  })
})

describe("gitlab render cache", () => {
  test("rewrites local links and skips unchanged hashes", async () => {
    const dir = await mkdtemp("mr-gitlab-")
    const shot = join(dir, "screenshots")

    await Bun.$`mkdir -p ${shot}`.quiet()
    await Bun.write(join(shot, "01-before.png"), "before")
    await Bun.write(join(shot, "01-after.png"), "after")

    let uploads = 0
    const markdown = "| ![Before](./screenshots/01-before.png) | ![After](./screenshots/01-after.png) |"

    const first = await renderGitlabMarkdown({
      markdown,
      mrDir: dir,
      cache: {},
      upload: async (absPath) => {
        uploads += 1
        const name = absPath.endsWith("before.png") ? "01-before" : "01-after"

        return {
          markdown: `![${name}](/uploads/x/${name}.png)`,
          url: `/uploads/x/${name}.png`,
        }
      },
    })

    expect(uploads).toBe(2)
    expect(first.markdown).toMatchInlineSnapshot(
      `"| ![Before](/uploads/x/01-before.png) | ![After](/uploads/x/01-after.png) |"`,
    )

    const second = await renderGitlabMarkdown({
      markdown,
      mrDir: dir,
      cache: first.cache,
      upload: async () => {
        uploads += 1

        return { markdown: "![no](/uploads/no.png)", url: "/uploads/no.png" }
      },
    })

    expect(uploads).toBe(2)
    expect(second.cached).toBe(2)
    expect(second.uploaded).toBe(0)
    expect(second.markdown).toBe(first.markdown)

    await Bun.write(join(shot, "01-after.png"), "after-changed")

    const third = await renderGitlabMarkdown({
      markdown,
      mrDir: dir,
      cache: second.cache,
      upload: async () => {
        uploads += 1

        return { markdown: "![01-after](/uploads/y/01-after.png)", url: "/uploads/y/01-after.png" }
      },
    })

    expect(uploads).toBe(3)
    expect(third.uploaded).toBe(1)
    expect(third.markdown).toContain("/uploads/y/01-after.png")
  })
})

async function mkdtemp(prefix: string) {
  const dir = (await Bun.$`mktemp -d ${join(Bun.env.TMPDIR || "/tmp", `${prefix}XXXXXX`)}`.quiet().text()).trim()

  dirs.push(dir)

  return dir
}
