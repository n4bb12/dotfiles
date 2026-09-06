import { join } from "node:path"

import { mrPaths } from "./git.ts"
import { localImageRefs, resolveImageRefs } from "./markdown.ts"
import { nextRemoteBody } from "./publish.ts"
import { type HostClient, type Io, MrError, type RenderResult, WORKSPACE_DIR, type Workspace } from "./types.ts"
import { pathExists, readText, writeText } from "./workspace.ts"

export async function collectLocalImages(workspace: Workspace, markdown: string) {
  const refs = resolveImageRefs(markdown, workspace.mrDir)
  const local = localImageRefs(refs)
  const missing: typeof local = []
  const available: typeof local = []

  for (const ref of local) {
    const exists = await pathExists(ref.absPath)

    if (exists) {
      available.push({ ...ref, exists: true })
    } else {
      missing.push({ ...ref, exists: false })
    }
  }

  return { refs, local, available, missing }
}

export function missingImagesMessage(missing: { dest: string }[]) {
  const lines = missing.map((ref) => `  ${ref.dest}`)

  return [
    "Missing images:",
    "",
    ...lines,
    "",
    `Add the files under ${WORKSPACE_DIR}/screenshots/ (paths are relative to ${WORKSPACE_DIR}/description.md)`,
    "and run mr status again.",
  ].join("\n")
}

export async function requireDescription(workspace: Workspace) {
  const path = mrPaths(workspace.repoRoot).description

  if (!(await pathExists(path))) {
    throw new MrError(`Missing ${WORKSPACE_DIR}/description.md. Write it, then run this command again.`)
  }

  return readText(path)
}

export async function statusImages(io: Io, workspace: Workspace) {
  const markdown = await requireDescription(workspace)
  const { local, available, missing } = await collectLocalImages(workspace, markdown)

  if (!local.length) {
    io.log(`No local images in ${WORKSPACE_DIR}/description.md`)

    return { missing }
  }

  io.log("MR images")
  io.log("")

  for (const ref of local) {
    const exists = available.some((item) => item.dest === ref.dest && item.start === ref.start)
    const mark = exists ? "✓" : "✗"

    io.log(`${mark} ${ref.dest}`)
  }

  io.log("")
  io.log(`${available.length}/${local.length} images available`)

  if (missing.length) {
    throw new MrError(missingImagesMessage(missing))
  }

  return { missing }
}

export async function renderForHost(input: {
  io: Io
  workspace: Workspace
  host: HostClient
  force: boolean
  remoteMarkdown: string
}): Promise<RenderResult> {
  const markdown = await requireDescription(input.workspace)
  const { available, missing } = await collectLocalImages(input.workspace, markdown)

  if (missing.length) {
    throw new MrError(missingImagesMessage(missing))
  }

  const attachments = unique(available.map((ref) => ref.attachPath))
  const hostRender = await input.host.render(input.workspace, markdown)
  const bodySource = input.host.kind === "gitlab" ? await readText(hostRender.bodyFile) : markdown
  const body = nextRemoteBody({
    localMarkdown: bodySource,
    remoteMarkdown: input.remoteMarkdown,
    force: input.force,
    lastPublishedHash: input.workspace.config.lastPublishedHash,
  })

  const publishName = input.host.kind === "gitlab" ? "description.remote.md" : "description.publish.md"
  const bodyPath = join(input.workspace.mrDir, publishName)

  await writeText(bodyPath, body)

  if (input.host.kind === "github") {
    input.io.log(
      attachments.length
        ? `Ready to attach ${attachments.length} image(s) with gh --attach`
        : "No local images to attach",
    )
  } else {
    input.io.log(
      `Wrote ${WORKSPACE_DIR}/description.remote.md (${hostRender.uploaded} uploaded, ${hostRender.cached} cached)`,
    )
  }

  return {
    bodyFile: bodyPath,
    attachments,
    uploaded: hostRender.uploaded,
    cached: hostRender.cached,
  }
}

function unique(items: string[]) {
  return [...new Set(items)]
}
