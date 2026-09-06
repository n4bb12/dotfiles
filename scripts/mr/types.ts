export class MrError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "MrError"
  }
}

export type HostKind = "github" | "gitlab"

export type MrConfig = {
  baseBranch: string
  title?: string
  lastPublishedHash?: string
  lastPublishedIid?: string
}

export type ImageRef = {
  alt: string
  dest: string
  full: string
  start: number
  end: number
  kind: "local" | "remote"
}

export type ResolvedImage = ImageRef & {
  absPath: string
  attachPath: string
  exists: boolean
}

export type CurrentRequest = {
  iid: string
  title: string
  description: string
  baseBranch: string
  url: string
}

export type CommandResult = {
  code: number
  stdout: string
  stderr: string
}

export type CommandRunner = (input: {
  argv: string[]
  cwd: string
  env?: Record<string, string>
  stdinInherit?: boolean
}) => Promise<CommandResult>

export type ChooseFn = (options: string[], header: string) => Promise<string>

export type Io = {
  cwd: string
  log: (message: string) => void
  warn: (message: string) => void
  stdinTty: boolean
  which: (name: string) => string | null
  runner: CommandRunner
  choose: ChooseFn
}

export type Workspace = {
  repoRoot: string
  mrDir: string
  config: MrConfig
}

export type UploadRecord = {
  hash: string
  markdown: string
  url: string
}

export type UploadCache = Record<string, UploadRecord>

export type RenderResult = {
  bodyFile: string
  attachments: string[]
  uploaded: number
  cached: number
}

export type PublishResult = {
  url: string
  iid: string
}

export type HostClient = {
  kind: HostKind
  isAuthenticated: () => Promise<boolean>
  getDefaultBranch: () => Promise<string | undefined>
  getCurrentRequest: () => Promise<CurrentRequest | undefined>
  ensureReady: () => Promise<void>
  render: (workspace: Workspace, markdown: string) => Promise<RenderResult>
  create: (input: {
    workspace: Workspace
    title: string
    bodyFile: string
    attachments: string[]
    headBranch: string
  }) => Promise<PublishResult>
  update: (input: {
    workspace: Workspace
    iid: string
    title?: string
    bodyFile: string
    attachments: string[]
  }) => Promise<PublishResult>
}

export const GENERATED_START = "<!-- mr-agent:generated:start -->"
export const GENERATED_END = "<!-- mr-agent:generated:end -->"
export const MAX_GITHUB_ATTACHMENTS = 50
export const CONFIG_NAME = "config.json"
export const DESCRIPTION_NAME = "description.md"
export const REMOTE_DESCRIPTION_NAME = "description.remote.md"
export const ANALYSIS_NAME = "analysis.json"
export const UPLOADS_NAME = "uploads.json"
