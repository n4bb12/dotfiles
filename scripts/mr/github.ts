import { isAbsolute, relative } from "node:path"

import { defaultRunner } from "./git.ts"
import { type CommandRunner, type HostClient, MAX_GITHUB_ATTACHMENTS, MrError } from "./types.ts"

export function githubCreateArgv(input: {
  title: string
  baseBranch: string
  headBranch: string
  bodyFile: string
  attachments: string[]
}) {
  assertAttachmentLimit(input.attachments)

  const argv = [
    "gh",
    "pr",
    "create",
    "--title",
    input.title,
    "--body-file",
    input.bodyFile,
    "--base",
    input.baseBranch,
    "--head",
    input.headBranch,
  ]

  for (const file of input.attachments) {
    argv.push("--attach", file)
  }

  return argv
}

export function githubUpdateArgv(input: { iid: string; title?: string; bodyFile: string; attachments: string[] }) {
  assertAttachmentLimit(input.attachments)

  const argv = ["gh", "pr", "edit", input.iid, "--body-file", input.bodyFile]

  if (input.title) {
    argv.push("--title", input.title)
  }

  for (const file of input.attachments) {
    argv.push("--attach", file)
  }

  return argv
}

export function createGithubClient(repoRoot: string, runner: CommandRunner = defaultRunner): HostClient {
  return {
    kind: "github",

    async isAuthenticated() {
      const result = await runner({ argv: ["gh", "auth", "status"], cwd: repoRoot })

      return result.code === 0
    },

    async getDefaultBranch() {
      const result = await runner({
        argv: ["gh", "repo", "view", "--json", "defaultBranchRef"],
        cwd: repoRoot,
      })

      if (result.code !== 0) {
        return undefined
      }

      return readDefaultBranch(result.stdout)
    },

    async getCurrentRequest() {
      const result = await runner({
        argv: ["gh", "pr", "view", "--json", "number,title,body,baseRefName,url"],
        cwd: repoRoot,
      })

      if (result.code !== 0) {
        return undefined
      }

      return readGithubPr(result.stdout)
    },

    async ensureReady() {
      const help = await runner({ argv: ["gh", "pr", "create", "--help"], cwd: repoRoot })

      if (!help.stdout.includes("--attach") && !help.stderr.includes("--attach")) {
        throw new MrError("This gh version has no --attach. Upgrade GitHub CLI: https://cli.github.com")
      }
    },

    async render(_workspace, _markdown) {
      return {
        bodyFile: "description.md",
        attachments: [],
        uploaded: 0,
        cached: 0,
      }
    },

    async create(input) {
      const result = await runner({
        argv: githubCreateArgv({
          title: input.title,
          baseBranch: input.workspace.config.baseBranch,
          headBranch: input.headBranch,
          bodyFile: githubBodyFile(input.workspace.mrDir, input.bodyFile),
          attachments: input.attachments,
        }),
        cwd: input.workspace.mrDir,
        env: { ...process.env, GH_PROMPT_DISABLED: "1" },
      })

      if (result.code !== 0) {
        throw new MrError(githubFailure(result.stderr || result.stdout, "create"))
      }

      return parseGithubResult(result.stdout)
    },

    async update(input) {
      const result = await runner({
        argv: githubUpdateArgv({
          iid: input.iid,
          title: input.title,
          bodyFile: githubBodyFile(input.workspace.mrDir, input.bodyFile),
          attachments: input.attachments,
        }),
        cwd: input.workspace.mrDir,
        env: { ...process.env, GH_PROMPT_DISABLED: "1" },
      })

      if (result.code !== 0) {
        throw new MrError(githubFailure(result.stderr || result.stdout, "update"))
      }

      return parseGithubResult(result.stdout, input.iid)
    },
  }
}

export function githubBodyFile(mrDir: string, bodyFile: string) {
  if (!isAbsolute(bodyFile)) {
    return bodyFile
  }

  return relative(mrDir, bodyFile)
}

export function assertAttachmentLimit(attachments: string[]) {
  if (attachments.length > MAX_GITHUB_ATTACHMENTS) {
    throw new MrError(
      `gh --attach allows at most ${MAX_GITHUB_ATTACHMENTS} files. Found ${attachments.length} local images.`,
    )
  }
}

function readDefaultBranch(stdout: string) {
  try {
    const parsed: unknown = JSON.parse(stdout)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined
    }

    const ref = (parsed as { defaultBranchRef?: unknown }).defaultBranchRef

    if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
      return undefined
    }

    const name = (ref as { name?: unknown }).name

    return typeof name === "string" && name ? name : undefined
  } catch {
    return undefined
  }
}

function readGithubPr(stdout: string) {
  try {
    const parsed: unknown = JSON.parse(stdout)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined
    }

    const record = parsed as Record<string, unknown>
    const number = record.number
    const iid = typeof number === "number" ? String(number) : typeof number === "string" ? number : ""

    if (!iid) {
      return undefined
    }

    return {
      iid,
      title: typeof record.title === "string" ? record.title : "",
      description: typeof record.body === "string" ? record.body : "",
      baseBranch: typeof record.baseRefName === "string" ? record.baseRefName : "",
      url: typeof record.url === "string" ? record.url : "",
    }
  } catch {
    return undefined
  }
}

function parseGithubResult(stdout: string, fallbackIid?: string) {
  const url = stdout
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("https://") || line.startsWith("http://"))

  const iidMatch = url?.match(/\/pull\/(\d+)/)
  const iid = iidMatch?.[1] ?? fallbackIid ?? ""

  return {
    url: url ?? stdout.trim(),
    iid,
  }
}

function githubFailure(message: string, action: string) {
  const hint = /push|upstream|does not exist|no commits between/i.test(message)
    ? "\nPush the branch yourself, then run mr create again."
    : ""

  return `gh pr ${action} failed.\n${message}${hint}`
}
