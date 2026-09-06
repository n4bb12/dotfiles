import { join } from "node:path"

import { defaultRunner } from "./git.ts"
import { parseGitlabMarkdownUrl, replaceLocalImageDestinations, resolveImageRefs } from "./markdown.ts"
import { type CommandRunner, type HostClient, MrError, type UploadCache } from "./types.ts"
import { hashFile, pathExists, readUploadCache, writeText, writeUploadCache } from "./workspace.ts"

export function parseGitlabUploadResponse(stdout: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new MrError(`GitLab upload did not return JSON.\n${stdout}`)
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new MrError("GitLab upload JSON must be an object with markdown.")
  }

  const record = parsed as Record<string, unknown>
  const markdown = record.markdown

  if (typeof markdown !== "string" || !markdown) {
    throw new MrError("GitLab upload JSON is missing markdown. Refusing to invent an upload URL.")
  }

  const urlFromField = typeof record.url === "string" ? record.url : ""
  const url = urlFromField || parseGitlabMarkdownUrl(markdown) || ""

  return { markdown, url }
}

export async function renderGitlabMarkdown(input: {
  markdown: string
  mrDir: string
  cache: UploadCache
  upload: (absPath: string) => Promise<{ markdown: string; url: string }>
}) {
  const refs = resolveImageRefs(input.markdown, input.mrDir)
  const replacements = new Map<string, string>()
  let uploaded = 0
  let cached = 0
  const nextCache: UploadCache = { ...input.cache }

  for (const ref of refs) {
    if (ref.kind !== "local") {
      continue
    }

    if (!(await pathExists(ref.absPath))) {
      continue
    }

    const hash = await hashFile(ref.absPath)
    const previous = nextCache[ref.attachPath]

    if (previous && previous.hash === hash) {
      const dest = parseGitlabMarkdownUrl(previous.markdown) ?? previous.url

      if (dest) {
        replacements.set(ref.dest, dest)
        cached += 1
        continue
      }
    }

    const uploadedFile = await input.upload(ref.absPath)
    const dest = parseGitlabMarkdownUrl(uploadedFile.markdown) ?? uploadedFile.url

    if (!dest) {
      throw new MrError(`GitLab upload markdown had no URL:\n${uploadedFile.markdown}`)
    }

    nextCache[ref.attachPath] = {
      hash,
      markdown: uploadedFile.markdown,
      url: uploadedFile.url || dest,
    }
    replacements.set(ref.dest, dest)
    uploaded += 1
  }

  return {
    markdown: replaceLocalImageDestinations(input.markdown, replacements),
    cache: nextCache,
    uploaded,
    cached,
  }
}

export function createGitlabClient(repoRoot: string, runner: CommandRunner = defaultRunner): HostClient {
  return {
    kind: "gitlab",

    async isAuthenticated() {
      const result = await runner({ argv: ["glab", "auth", "status"], cwd: repoRoot })

      return result.code === 0
    },

    async getDefaultBranch() {
      const result = await runner({ argv: ["glab", "repo", "view", "-F", "json"], cwd: repoRoot })

      if (result.code !== 0) {
        return undefined
      }

      return readGitlabDefaultBranch(result.stdout)
    },

    async getCurrentRequest() {
      const result = await runner({ argv: ["glab", "mr", "view", "-F", "json"], cwd: repoRoot })

      if (result.code !== 0) {
        return undefined
      }

      return readGitlabMr(result.stdout)
    },

    async ensureReady() {
      return
    },

    async render(workspace, markdown) {
      const cachePath = join(workspace.mrDir, "uploads.json")
      const cache = await readUploadCache(cachePath)
      const rendered = await renderGitlabMarkdown({
        markdown,
        mrDir: workspace.mrDir,
        cache,
        upload: async (absPath) => uploadGitlabFile(repoRoot, absPath, runner),
      })

      await writeUploadCache(cachePath, rendered.cache)

      const bodyFile = join(workspace.mrDir, "description.remote.md")

      await writeText(bodyFile, rendered.markdown)

      return {
        bodyFile,
        attachments: [],
        uploaded: rendered.uploaded,
        cached: rendered.cached,
      }
    },

    async create(input) {
      const result = await runner({
        argv: [
          "glab",
          "mr",
          "create",
          "--title",
          input.title,
          "--description-file",
          input.bodyFile,
          "--target-branch",
          input.workspace.config.baseBranch,
          "--source-branch",
          input.headBranch,
          "--yes",
          "--no-editor",
        ],
        cwd: repoRoot,
      })

      if (result.code !== 0) {
        throw new MrError(gitlabFailure(result.stderr || result.stdout, "create"))
      }

      return parseGitlabResult(result.stdout)
    },

    async update(input) {
      const argv = ["glab", "mr", "update", input.iid, "--description-file", input.bodyFile]

      if (input.title) {
        argv.push("--title", input.title)
      }

      const result = await runner({ argv, cwd: repoRoot })

      if (result.code !== 0) {
        throw new MrError(gitlabFailure(result.stderr || result.stdout, "update"))
      }

      return parseGitlabResult(result.stdout, input.iid)
    },
  }
}

async function uploadGitlabFile(repoRoot: string, absPath: string, runner: CommandRunner) {
  const result = await runner({
    argv: ["glab", "api", "projects/:fullpath/uploads", "--form", `file=@${absPath}`],
    cwd: repoRoot,
  })

  if (result.code !== 0) {
    throw new MrError(`GitLab upload failed for ${absPath}.\n${result.stderr || result.stdout}`)
  }

  return parseGitlabUploadResponse(result.stdout)
}

function readGitlabDefaultBranch(stdout: string) {
  try {
    const parsed: unknown = JSON.parse(stdout)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined
    }

    const record = parsed as Record<string, unknown>
    const defaultBranch = record.default_branch ?? record.defaultBranch

    return typeof defaultBranch === "string" && defaultBranch ? defaultBranch : undefined
  } catch {
    return undefined
  }
}

function readGitlabMr(stdout: string) {
  try {
    const parsed: unknown = JSON.parse(stdout)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined
    }

    const record = parsed as Record<string, unknown>
    const iidValue = record.iid ?? record.iid_str
    const iid = typeof iidValue === "number" ? String(iidValue) : typeof iidValue === "string" ? iidValue : ""

    if (!iid) {
      return undefined
    }

    const target = record.target_branch ?? record.targetBranch

    return {
      iid,
      title: typeof record.title === "string" ? record.title : "",
      description: typeof record.description === "string" ? record.description : "",
      baseBranch: typeof target === "string" ? target : "",
      url: typeof record.web_url === "string" ? record.web_url : "",
    }
  } catch {
    return undefined
  }
}

function parseGitlabResult(stdout: string, fallbackIid?: string) {
  const url = stdout
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^https?:\/\//.test(line) || line.includes("/-/merge_requests/"))

  const iidMatch = url?.match(/merge_requests\/(\d+)/)
  const iid = iidMatch?.[1] ?? fallbackIid ?? ""

  return {
    url: url ?? stdout.trim(),
    iid,
  }
}

function gitlabFailure(message: string, action: string) {
  const hint = /push|exists on remote|source branch/i.test(message)
    ? "\nPush the branch yourself, then run mr create again."
    : ""

  return `glab mr ${action} failed.\n${message}${hint}`
}
