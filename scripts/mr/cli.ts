#!/usr/bin/env bun

import {
  currentBranch,
  defaultRunner,
  detectHostKind,
  mrPaths,
  originUrl,
  requireRepoRoot,
  resolveBaseRef,
} from "./git.ts"
import { createHostClient } from "./host.ts"
import { commitSubjects, inspectRepo, suggestTitle } from "./inspect.ts"
import { chooseWithGum, pickBaseBranch, suggestBaseBranches } from "./prompt-base.ts"
import { requireTool } from "./publish.ts"
import { renderForHost, statusImages } from "./render.ts"
import { type Io, MrError, type Workspace } from "./types.ts"
import { ensureWorkspaceDirs, hashText, pathExists, readConfig, writeConfig } from "./workspace.ts"

const USAGE = `Usage: mr <command> [options]

Commands:
  init      Create .mr/ and choose a base branch
  inspect   Refresh git facts in .mr/analysis.json
  status    Check local images referenced by .mr/description.md
  render    Build the host markdown locally (no create/update)
  create    Create the merge request or pull request
  update    Update the existing merge request or pull request
  help      Show this help

Options:
  --base <branch>   Base branch (skips the prompt)
  --title <title>   Title for create/update
  --force           Replace a remote description that has no mr-agent markers`

export async function run(argv: string[], io: Partial<Io> = {}) {
  const ctx = resolveIo(io)
  const flags = parseArgs(argv)

  if (flags.command === "help" || !flags.command) {
    ctx.log(USAGE)
    return
  }

  switch (flags.command) {
    case "init":
      await initCommand(ctx, flags)
      return
    case "inspect":
      await inspectCommand(ctx)
      return
    case "status":
      await statusCommand(ctx)
      return
    case "render":
      await renderCommand(ctx, flags.force)
      return
    case "create":
      await publishCommand(ctx, "create", flags)
      return
    case "update":
      await publishCommand(ctx, "update", flags)
      return
    default:
      throw new MrError(`Unknown command: ${flags.command}\n\n${USAGE}`)
  }
}

function resolveIo(io: Partial<Io>): Io {
  const cwd = io.cwd ?? process.cwd()
  const which = io.which ?? ((name: string) => Bun.which(name))
  const runner = io.runner ?? defaultRunner

  return {
    cwd,
    log: io.log ?? console.log,
    warn: io.warn ?? console.error,
    stdinTty: io.stdinTty ?? Boolean(process.stdin.isTTY),
    which,
    runner,
    choose:
      io.choose ??
      ((options, header) =>
        chooseWithGum(
          {
            cwd,
            log: io.log ?? console.log,
            warn: io.warn ?? console.error,
            stdinTty: io.stdinTty ?? Boolean(process.stdin.isTTY),
            which,
            runner,
            choose: async () => options[0] ?? "",
          },
          options,
          header,
        )),
  }
}

function parseArgs(argv: string[]) {
  let command: string | undefined
  let base: string | undefined
  let title: string | undefined
  let force = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (typeof arg !== "string") {
      break
    }

    if (arg === "-h" || arg === "--help") {
      return { command: "help", base, title, force }
    }

    if (arg === "--force") {
      force = true
      continue
    }

    if (arg === "--base") {
      const value = argv[i + 1]

      if (typeof value !== "string") {
        throw new MrError("Missing branch after --base")
      }

      base = value
      i++
      continue
    }

    if (arg === "--title") {
      const value = argv[i + 1]

      if (typeof value !== "string") {
        throw new MrError("Missing title after --title")
      }

      title = value
      i++
      continue
    }

    if (arg.startsWith("-")) {
      throw new MrError(`Unknown option: ${arg}\n\n${USAGE}`)
    }

    if (!command) {
      command = arg
      continue
    }

    throw new MrError(`Unexpected argument: ${arg}\n\n${USAGE}`)
  }

  return { command, base, title, force }
}

async function initCommand(io: Io, flags: { base?: string; title?: string }) {
  requireTool(io.which, "git", "Install git and retry.")
  requireTool(io.which, "bun", "Install bun and retry.")

  const repoRoot = await requireRepoRoot(io.cwd, io.runner)
  const paths = await ensureWorkspaceDirs(repoRoot)
  const existing = (await pathExists(paths.config)) ? await readConfig(paths.config).catch(() => undefined) : undefined
  const extra: string[] = []

  if (existing?.baseBranch) {
    extra.push(existing.baseBranch)
  }

  try {
    const origin = await originUrl(repoRoot, io.runner)
    const kind = detectHostKind(origin)
    const host = createHostClient(kind, repoRoot, io.runner)
    const current = await host.getCurrentRequest().catch(() => undefined)

    if (current?.baseBranch) {
      extra.unshift(current.baseBranch)
    }

    const defaultBranch = await host.getDefaultBranch().catch(() => undefined)

    if (defaultBranch) {
      extra.push(defaultBranch)
    }
  } catch {
    // Host lookup is optional during init.
  }

  const suggestions = await suggestBaseBranches(repoRoot, io, extra)
  const baseBranch = flags.base?.trim() || existing?.baseBranch || (await pickBaseBranch(io, suggestions, flags.base))
  const config = {
    baseBranch,
    title: flags.title ?? existing?.title,
    lastPublishedHash: existing?.lastPublishedHash,
    lastPublishedIid: existing?.lastPublishedIid,
  }

  await writeConfig(paths.config, config)
  io.log(`Base branch: ${baseBranch}`)
  io.log("Created .mr/")

  const workspace: Workspace = { repoRoot, mrDir: paths.mrDir, config }

  await inspectAfterInit(io, workspace)
}

async function inspectAfterInit(io: Io, workspace: Workspace) {
  try {
    const origin = await originUrl(workspace.repoRoot, io.runner)
    const kind = detectHostKind(origin)
    const host = createHostClient(kind, workspace.repoRoot, io.runner)
    const current = await host.getCurrentRequest().catch(() => undefined)

    await inspectRepo(io, workspace, kind, current)
  } catch {
    await inspectRepo(io, workspace, "github")
  }
}

async function loadWorkspace(io: Io): Promise<Workspace> {
  requireTool(io.which, "git", "Install git and retry.")

  const repoRoot = await requireRepoRoot(io.cwd, io.runner)
  const paths = mrPaths(repoRoot)
  const config = await readConfig(paths.config)

  return { repoRoot, mrDir: paths.mrDir, config }
}

async function inspectCommand(io: Io) {
  const workspace = await loadWorkspace(io)
  const { host, kind } = await optionalHost(io, workspace)
  const current = host ? await host.getCurrentRequest().catch(() => undefined) : undefined

  await inspectRepo(io, workspace, kind, current)
}

async function statusCommand(io: Io) {
  const workspace = await loadWorkspace(io)

  await statusImages(io, workspace)
}

async function renderCommand(io: Io, force: boolean) {
  const workspace = await loadWorkspace(io)
  const { host } = await requireHost(io, workspace, true)
  const current = await host.getCurrentRequest().catch(() => undefined)

  await renderForHost({
    io,
    workspace,
    host,
    force,
    remoteMarkdown: current?.description ?? "",
  })
}

async function publishCommand(io: Io, action: "create" | "update", flags: { title?: string; force: boolean }) {
  const workspace = await loadWorkspace(io)
  const { host, kind } = await requireHost(io, workspace, true)

  await host.ensureReady()

  const authenticated = await host.isAuthenticated()

  if (!authenticated) {
    throw new MrError(
      kind === "github"
        ? "gh is not authenticated. Run gh auth login."
        : "glab is not authenticated. Run glab auth login.",
    )
  }

  const current = await host.getCurrentRequest().catch(() => undefined)

  if (action === "create" && current) {
    throw new MrError(
      `A ${kind === "github" ? "pull request" : "merge request"} already exists (${current.url || current.iid}).\nRun mr update.`,
    )
  }

  if (action === "update" && !current) {
    throw new MrError(`No ${kind === "github" ? "pull request" : "merge request"} for this branch. Run mr create.`)
  }

  const rendered = await renderForHost({
    io,
    workspace,
    host,
    force: flags.force,
    remoteMarkdown: current?.description ?? "",
  })

  const headBranch = await currentBranch(workspace.repoRoot, io.runner)
  const baseRef = await resolveBaseRef(workspace.repoRoot, workspace.config.baseBranch, io.runner)
  const subjects = await commitSubjects(workspace.repoRoot, baseRef, io.runner)
  const title = flags.title ?? workspace.config.title ?? suggestTitle(headBranch, subjects)
  const published =
    action === "create"
      ? await host.create({
          workspace,
          title,
          bodyFile: rendered.bodyFile,
          attachments: rendered.attachments,
          headBranch,
        })
      : await host.update({
          workspace,
          iid: current?.iid ?? "",
          title: flags.title,
          bodyFile: rendered.bodyFile,
          attachments: rendered.attachments,
        })

  const body = await Bun.file(rendered.bodyFile).text()
  const nextConfig = {
    ...workspace.config,
    title,
    lastPublishedHash: hashText(body),
    lastPublishedIid: published.iid || current?.iid,
  }

  await writeConfig(mrPaths(workspace.repoRoot).config, nextConfig)
  io.log(action === "create" ? "Created" : "Updated")
  io.log(published.url || published.iid)
}

async function optionalHost(io: Io, workspace: Workspace) {
  try {
    const origin = await originUrl(workspace.repoRoot, io.runner)
    const kind = detectHostKind(origin)

    return { kind, host: createHostClient(kind, workspace.repoRoot, io.runner) }
  } catch {
    return { kind: "github" as const, host: undefined }
  }
}

async function requireHost(io: Io, workspace: Workspace, needCli: boolean) {
  const origin = await originUrl(workspace.repoRoot, io.runner)
  const kind = detectHostKind(origin)

  if (needCli) {
    if (kind === "github") {
      requireTool(io.which, "gh", "Install GitHub CLI: https://cli.github.com")
    } else {
      requireTool(io.which, "glab", "Install GitLab CLI: https://gitlab.com/gitlab-org/cli")
    }
  }

  return { kind, host: createHostClient(kind, workspace.repoRoot, io.runner) }
}

if (import.meta.main) {
  try {
    await run(process.argv.slice(2))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error(message)
    process.exitCode = 1
  }
}
