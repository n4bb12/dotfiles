import { describe, expect, test } from "bun:test"

import { nextRemoteBody } from "./publish.ts"
import { GENERATED_END, GENERATED_START, MrError } from "./types.ts"
import { hashText } from "./workspace.ts"

describe("remote description splice", () => {
  test("wraps a new description when remote is empty", () => {
    const body = nextRemoteBody({
      localMarkdown: "Hello",
      remoteMarkdown: "",
      force: false,
    })

    expect(body).toContain(GENERATED_START)
    expect(body).toContain("Hello")
    expect(body).toContain(GENERATED_END)
  })

  test("replaces only the generated region", () => {
    const remote = `Notes from review\n\n${GENERATED_START}\n\nold\n\n${GENERATED_END}\n\nThanks\n`
    const body = nextRemoteBody({
      localMarkdown: "new summary",
      remoteMarkdown: remote,
      force: false,
    })

    expect(body).toMatchInlineSnapshot(`
      "Notes from review

      <!-- mr-agent:generated:start -->

      new summary

      <!-- mr-agent:generated:end -->

      Thanks
      "
    `)
  })

  test("refuses to overwrite a custom remote description", () => {
    expect(() =>
      nextRemoteBody({
        localMarkdown: "new",
        remoteMarkdown: "hand written",
        force: false,
      }),
    ).toThrow(MrError)
  })

  test("replaces when last published hash matches or --force is set", () => {
    const remote = "hand written"

    expect(
      nextRemoteBody({
        localMarkdown: "new",
        remoteMarkdown: remote,
        force: false,
        lastPublishedHash: hashText(remote),
      }),
    ).toContain("new")

    expect(
      nextRemoteBody({
        localMarkdown: "forced",
        remoteMarkdown: remote,
        force: true,
      }),
    ).toContain("forced")
  })
})
