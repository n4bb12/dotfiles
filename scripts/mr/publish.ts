import { MrError } from "./types.ts"
import { extractGenerated, hashText, spliceGenerated, wrapGenerated } from "./workspace.ts"

export function nextRemoteBody(input: {
  localMarkdown: string
  remoteMarkdown: string
  force: boolean
  lastPublishedHash?: string
}) {
  const generated = extractGenerated(input.localMarkdown).generated
  const wrapped = wrapGenerated(generated)
  const remote = input.remoteMarkdown
  const spliced = spliceGenerated(remote, generated)

  if (spliced) {
    return spliced
  }

  if (!remote.trim()) {
    return wrapped
  }

  if (input.lastPublishedHash && hashText(remote) === input.lastPublishedHash) {
    return wrapped
  }

  if (input.force) {
    return wrapped
  }

  throw new MrError(
    [
      "The existing merge request description has no mr-agent markers.",
      "Re-run with --force to replace it, or add these markers around the generated section:",
      "",
      "<!-- mr-agent:generated:start -->",
      "",
      "<!-- mr-agent:generated:end -->",
    ].join("\n"),
  )
}

export function requireTool(ioWhich: (name: string) => string | null, name: string, hint: string) {
  if (ioWhich(name)) {
    return
  }

  throw new MrError(`${name} is required. ${hint}`)
}
