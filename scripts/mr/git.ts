import { dirname, join } from "node:path"

import { type CommandRunner, type HostKind, MrError, WORKSPACE_DIR } from "./types.ts"

export async function defaultRunner(input: {
  argv: string[]
  cwd: string
  env?: Record<string, string>
  stdinInherit?: boolean
}): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(input.argv, {
    cwd: input.cwd,
    env: { ...process.env, ...input.env },
    stdin: input.stdinInherit ? "inherit" : "ignore",
    stdout: "pipe",
    stderr: input.stdinInherit ? "inherit" : "pipe",
  })

  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  return {
    code,
    stdout: stdout.trimEnd(),
    stderr: stderr.trimEnd(),
  }
}

export async function git(cwd: string, args: string[], runner: CommandRunner = defaultRunner) {
  return runner({
    argv: ["git", "-C", cwd, ...args],
    cwd,
  })
}

export async function gitText(cwd: string, args: string[], runner: CommandRunner = defaultRunner) {
  const result = await git(cwd, args, runner)

  if (result.code !== 0) {
    throw new MrError(result.stderr || result.stdout || `git ${args.join(" ")} failed`)
  }

  return result.stdout
}

export async function gitOk(cwd: string, args: string[], runner: CommandRunner = defaultRunner) {
  const result = await git(cwd, args, runner)

  return result.code === 0
}

export async function requireRepoRoot(cwd: string, runner: CommandRunner = defaultRunner) {
  const result = await git(cwd, ["rev-parse", "--show-toplevel"], runner)

  if (result.code !== 0 || !result.stdout.trim()) {
    throw new MrError("You are not inside a git repository.")
  }

  return result.stdout.trim()
}

export async function currentBranch(repoRoot: string, runner: CommandRunner = defaultRunner) {
  const name = await gitText(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"], runner)

  if (name === "HEAD") {
    throw new MrError("Detached HEAD. Check out a branch before running mr.")
  }

  return name
}

export async function originUrl(repoRoot: string, runner: CommandRunner = defaultRunner) {
  const result = await git(repoRoot, ["config", "--get", "remote.origin.url"], runner)

  if (result.code !== 0 || !result.stdout.trim()) {
    throw new MrError("No remote.origin.url. Add an origin remote first.")
  }

  return result.stdout.trim()
}

export function originHostname(origin: string) {
  const trimmed = origin.trim()
  const scp = trimmed.match(/^git@([^:]+):/)

  if (scp?.[1]) {
    return scp[1].toLowerCase()
  }

  const ssh = trimmed.match(/^ssh:\/\/(?:git@)?([^/]+)/)

  if (ssh?.[1]) {
    return ssh[1].toLowerCase()
  }

  try {
    const withScheme = trimmed.includes("://") ? trimmed : `https://${trimmed}`

    return new URL(withScheme).hostname.toLowerCase()
  } catch {
    throw new MrError(`Could not parse git origin: ${origin}`)
  }
}

export function detectHostKind(origin: string): HostKind {
  const host = originHostname(origin)

  if (host === "github.com" || host.startsWith("github.") || host.includes(".github.")) {
    return "github"
  }

  if (host.includes("gitlab")) {
    return "gitlab"
  }

  throw new MrError(`Unsupported git host '${host}'. Expected GitHub or GitLab.`)
}

export async function resolveBaseRef(repoRoot: string, baseBranch: string, runner: CommandRunner = defaultRunner) {
  const candidates = [`origin/${baseBranch}`, baseBranch, `refs/remotes/origin/${baseBranch}`]

  for (const candidate of candidates) {
    if (await gitOk(repoRoot, ["rev-parse", "--verify", candidate], runner)) {
      return candidate
    }
  }

  throw new MrError(
    `Base branch '${baseBranch}' was not found.\nFetch the remote, or pick another with mr init --base.`,
  )
}

export async function originHeadBranch(repoRoot: string, runner: CommandRunner = defaultRunner) {
  const result = await git(repoRoot, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"], runner)

  if (result.code !== 0) {
    return undefined
  }

  return result.stdout.trim().replace(/^origin\//, "") || undefined
}

export async function branchExists(repoRoot: string, name: string, runner: CommandRunner = defaultRunner) {
  return gitOk(repoRoot, ["rev-parse", "--verify", name], runner)
}

export function mrPaths(repoRoot: string) {
  const mrDir = join(repoRoot, WORKSPACE_DIR)

  return {
    repoRoot,
    mrDir,
    config: join(mrDir, "config.json"),
    description: join(mrDir, "description.md"),
    remoteDescription: join(mrDir, "description.remote.md"),
    analysis: join(mrDir, "analysis.json"),
    uploads: join(mrDir, "uploads.json"),
    screenshots: join(mrDir, "screenshots"),
    context: join(mrDir, "context"),
    exclude: join(repoRoot, ".git/info/exclude"),
    gitInfo: join(repoRoot, ".git/info"),
    gitDir: dirname(join(repoRoot, ".git/info")),
  }
}
