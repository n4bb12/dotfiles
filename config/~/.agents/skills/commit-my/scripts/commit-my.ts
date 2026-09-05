#!/usr/bin/env bun

import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { homedir, tmpdir } from "node:os"
import { dirname, isAbsolute, join } from "node:path"

const STATE_NAME = "commit-my-state.json"

const LEFTHOOK_FILES = ["lefthook.yml", "lefthook.yaml", ".lefthook.yml", ".lefthook.yaml", "lefthook.toml"]

const USAGE = `Usage: commit-my <command> [sandbox] [--json]

Commands:
  start     Create an isolated worktree sandbox and copy dirty files into it
  isolate   Drop unstaged sandbox changes so the worktree matches the index
  refresh   Restore remaining snapshot files after a sandbox commit
  finish    Replay sandbox commits onto the current branch tip and delete the sandbox
  abort     Delete the sandbox without integrating
  status    Show the active sandbox
  help      Show this help

The shared working tree is never modified. Only finish updates the branch ref.`

export class CommitMyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CommitMyError"
  }
}

type CommitMyState = {
  version: 1
  sharedRoot: string
  branch: string
  startHead: string
  snapshotTree: string
  sandbox: string
}

type Io = {
  cwd: string
  log: (message: string) => void
  warn: (message: string) => void
}

type GitResult = {
  code: number
  stdout: string
  stderr: string
}

export async function run(argv: string[], io: Partial<Io> = {}) {
  const cwd = io.cwd ?? process.cwd()
  const log = io.log ?? console.log
  const warn = io.warn ?? console.error
  const ctx: Io = { cwd, log, warn }
  const { command, sandboxArg, json } = parseArgs(argv)

  if (!command || command === "help" || command === "-h" || command === "--help") {
    log(USAGE)
    return
  }

  switch (command) {
    case "start":
      await start(ctx, json)
      return
    case "isolate":
      await isolate(ctx, sandboxArg)
      return
    case "refresh":
      await refresh(ctx, sandboxArg)
      return
    case "finish":
      await finish(ctx, sandboxArg)
      return
    case "abort":
      await abort(ctx, sandboxArg)
      return
    case "status":
      await status(ctx, sandboxArg, json)
      return
    default:
      throw new CommitMyError(`Unknown command: ${command}\n\n${USAGE}`)
  }
}

function parseArgs(argv: string[]) {
  const json = argv.includes("--json")
  const rest = argv.filter((arg) => arg !== "--json")
  const command = rest[0]
  const sandboxArg = rest[1]

  return { command, sandboxArg, json }
}

async function start(io: Io, json: boolean) {
  const sharedRoot = await requireRepoRoot(io.cwd)

  await assertUsableSharedRepo(sharedRoot)

  const branch = await gitText(sharedRoot, ["rev-parse", "--abbrev-ref", "HEAD"])

  if (branch === "HEAD") {
    throw new CommitMyError("commit-my requires a branch. The shared repository is in detached HEAD.")
  }

  const startHead = await gitText(sharedRoot, ["rev-parse", "HEAD"])
  const snapshotTree = await writeSnapshotTree(sharedRoot)
  const sandboxRoot = await mkdtemp(join(tmpdir(), "commit-my-"))
  const sandbox = join(sandboxRoot, "work")

  try {
    await gitText(sharedRoot, ["worktree", "add", "--detach", sandbox, startHead])
    await gitText(sandbox, ["restore", "--source", snapshotTree, "--worktree", "--no-overlay", "--", "."])
    await prepareSandboxTooling(sharedRoot, sandbox, io.warn)

    const state: CommitMyState = {
      version: 1,
      sharedRoot,
      branch,
      startHead,
      snapshotTree,
      sandbox,
    }

    await writeState(sandbox, state)
  } catch (error) {
    await removeSandbox(sharedRoot, sandbox)
    await rm(sandboxRoot, { recursive: true, force: true })
    throw error
  }

  if (json) {
    io.log(
      JSON.stringify(
        {
          sandbox,
          branch,
          head: startHead,
          snapshotTree,
        },
        null,
        2,
      ),
    )
    return
  }

  io.log(`commit-my sandbox ready`)
  io.log(`sandbox: ${sandbox}`)
  io.log(`branch: ${branch}`)
  io.log(`head: ${startHead}`)
  io.log("")
  io.log("cd into the sandbox, stage your changes, then:")
  io.log("  commit-my isolate")
  io.log("  git commit")
  io.log("  commit-my refresh    # optional, for another atomic commit")
  io.log("  commit-my finish")
}

async function isolate(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await gitText(state.sandbox, ["restore", "."])
  await gitText(state.sandbox, ["clean", "-fd", "--exclude=node_modules"])
  await prepareSandboxTooling(state.sharedRoot, state.sandbox, io.warn)

  const statusText = await gitText(state.sandbox, ["status", "--short"])

  io.log(statusText || "sandbox working tree matches the index")
}

async function refresh(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await gitText(state.sandbox, ["restore", "--source", state.snapshotTree, "--worktree", "--no-overlay", "--", "."])
  await prepareSandboxTooling(state.sharedRoot, state.sandbox, io.warn)

  const statusText = await gitText(state.sandbox, ["status", "--short"])

  io.log(statusText || "no remaining snapshot changes")
}

async function finish(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await assertNoRebaseInProgress(state.sandbox)

  const sandboxHead = await gitText(state.sandbox, ["rev-parse", "HEAD"])

  if (sandboxHead === state.startHead) {
    throw new CommitMyError("No commits in the sandbox. Commit first, or run commit-my abort.")
  }

  const currentHead = await gitText(state.sharedRoot, ["rev-parse", state.branch])

  if (sandboxHead === currentHead) {
    await removeSandbox(state.sharedRoot, state.sandbox)
    io.log("nothing to integrate")
    return
  }

  const mergeBase = await gitText(state.sandbox, ["merge-base", sandboxHead, currentHead])

  if (mergeBase !== currentHead) {
    const result = await git(state.sandbox, ["rebase", "--onto", currentHead, mergeBase])

    if (result.code !== 0) {
      throw new CommitMyError(
        [
          "Rebase conflict while integrating onto the current branch tip.",
          "Resolve the conflict in the sandbox, then run git rebase --continue and commit-my finish.",
          "Or run commit-my abort to drop the sandbox.",
          `sandbox: ${state.sandbox}`,
          result.stderr || result.stdout,
        ].join("\n"),
      )
    }
  }

  const newTip = await gitText(state.sandbox, ["rev-parse", "HEAD"])

  if (newTip !== currentHead) {
    const updated = await git(state.sharedRoot, ["update-ref", `refs/heads/${state.branch}`, newTip, currentHead])

    if (updated.code !== 0) {
      throw new CommitMyError(
        [
          "Branch moved while integrating. Re-run commit-my finish.",
          `sandbox: ${state.sandbox}`,
          updated.stderr || updated.stdout,
        ].join("\n"),
      )
    }

    await refreshSharedIndex(state.sharedRoot, state.startHead, newTip)
  }

  const short = await gitText(state.sharedRoot, ["log", "--oneline", `${currentHead}..${newTip}`])

  await removeSandbox(state.sharedRoot, state.sandbox)

  io.log(short ? `integrated:\n${short}` : "integrated")
}

async function abort(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await git(state.sandbox, ["rebase", "--abort"])
  await removeSandbox(state.sharedRoot, state.sandbox)

  io.log(`removed sandbox ${state.sandbox}`)
}

async function status(io: Io, sandboxArg: string | undefined, json: boolean) {
  const state = await loadState(io, sandboxArg)

  if (json) {
    io.log(JSON.stringify(state, null, 2))
    return
  }

  io.log(`sandbox: ${state.sandbox}`)
  io.log(`shared: ${state.sharedRoot}`)
  io.log(`branch: ${state.branch}`)
  io.log(`start: ${state.startHead}`)
}

async function writeSnapshotTree(sharedRoot: string) {
  const indexDir = await mkdtemp(join(tmpdir(), "commit-my-index-"))
  const indexPath = join(indexDir, "index")

  try {
    await gitText(sharedRoot, ["read-tree", "HEAD"], { GIT_INDEX_FILE: indexPath })
    await gitText(sharedRoot, ["add", "-A"], { GIT_INDEX_FILE: indexPath })
    return await gitText(sharedRoot, ["write-tree"], { GIT_INDEX_FILE: indexPath })
  } finally {
    await rm(indexDir, { recursive: true, force: true })
  }
}

async function prepareSandboxTooling(sharedRoot: string, sandbox: string, warn: (message: string) => void) {
  await linkPackageNodeModules(sharedRoot, sandbox)
  await installLefthook(sandbox, warn)
}

async function linkPackageNodeModules(sharedRoot: string, sandbox: string) {
  const dirs = new Set(["."])
  const tracked = await gitText(sharedRoot, ["ls-files"])

  for (const file of tracked.split("\n")) {
    if (file.endsWith("package.json")) {
      dirs.add(dirname(file))
    }
  }

  for (const dir of dirs) {
    const source = join(sharedRoot, dir, "node_modules")
    const dest = join(sandbox, dir, "node_modules")

    if (!(await pathExists(source)) || (await pathExists(dest))) {
      continue
    }

    await mkdir(dirname(dest), { recursive: true })
    await symlink(source, dest)
  }
}

async function installLefthook(sandbox: string, warn: (message: string) => void) {
  let hasConfig = false

  for (const name of LEFTHOOK_FILES) {
    if (await pathExists(join(sandbox, name))) {
      hasConfig = true
      break
    }
  }

  if (!hasConfig) {
    return
  }

  const binary = await findLefthook(sandbox)

  if (!binary) {
    warn("lefthook config found, but lefthook is not installed")
    return
  }

  const result = await spawnCommand(sandbox, [binary, "install"])

  if (result.code !== 0) {
    warn(result.stderr || result.stdout || "lefthook install failed")
  }
}

async function findLefthook(sandbox: string) {
  const local = join(sandbox, "node_modules", ".bin", "lefthook")

  if (await pathExists(local)) {
    return local
  }

  const which = await spawnCommand(sandbox, ["sh", "-c", "command -v lefthook"])

  if (which.code === 0 && which.stdout) {
    return which.stdout
  }
}

async function refreshSharedIndex(sharedRoot: string, startHead: string, newTip: string) {
  const names = await gitText(sharedRoot, ["diff", "--name-only", "--diff-filter=ACDMRTUXB", `${startHead}..${newTip}`])
  const paths = names.split("\n").filter(Boolean)

  if (!paths.length) {
    return
  }

  await git(sharedRoot, ["restore", "--staged", "--", ...paths])
}

async function removeSandbox(sharedRoot: string, sandbox: string) {
  const result = await git(sharedRoot, ["worktree", "remove", "--force", sandbox])

  if (result.code !== 0) {
    await rm(sandbox, { recursive: true, force: true })
    await git(sharedRoot, ["worktree", "prune"])
  }

  await rm(dirname(sandbox), { recursive: true, force: true })
}

async function loadState(io: Io, sandboxArg?: string): Promise<CommitMyState> {
  if (sandboxArg) {
    const sandbox = resolvePath(io.cwd, sandboxArg)
    return readState(sandbox)
  }

  const fromCwd = await readStateIfPresent(io.cwd)

  if (fromCwd) {
    return fromCwd
  }

  const sharedRoot = await requireRepoRoot(io.cwd)
  const matches = await listSandboxes(sharedRoot)

  if (matches.length === 1) {
    const only = matches[0]

    if (only) {
      return only
    }
  }

  if (matches.length > 1) {
    const paths = matches.map((state) => state.sandbox).join("\n")
    throw new CommitMyError(`Multiple commit-my sandboxes exist. Pass one:\n${paths}`)
  }

  throw new CommitMyError("No commit-my sandbox found. Run commit-my start first.")
}

async function listSandboxes(sharedRoot: string) {
  const porcelain = await gitText(sharedRoot, ["worktree", "list", "--porcelain"])
  const found: CommitMyState[] = []

  for (const line of porcelain.split("\n")) {
    if (!line.startsWith("worktree ")) {
      continue
    }

    const worktree = line.slice("worktree ".length)
    const state = await readStateIfPresent(worktree)

    if (state) {
      found.push(state)
    }
  }

  return found
}

async function writeState(sandbox: string, state: CommitMyState) {
  const gitDir = await gitText(sandbox, ["rev-parse", "--absolute-git-dir"])
  await writeFile(join(gitDir, STATE_NAME), `${JSON.stringify(state, null, 2)}\n`)
}

async function readState(sandbox: string) {
  const state = await readStateIfPresent(sandbox)

  if (!state) {
    throw new CommitMyError(`Not a commit-my sandbox: ${sandbox}`)
  }

  return state
}

async function readStateIfPresent(sandbox: string) {
  const gitDirResult = await git(sandbox, ["rev-parse", "--absolute-git-dir"])

  if (gitDirResult.code !== 0) {
    return
  }

  const statePath = join(gitDirResult.stdout, STATE_NAME)

  if (!(await pathExists(statePath))) {
    return
  }

  const parsed: unknown = JSON.parse(await readFile(statePath, "utf8"))

  if (!isState(parsed)) {
    throw new CommitMyError(`Invalid commit-my state at ${statePath}`)
  }

  return parsed
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isState(value: unknown): value is CommitMyState {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.version === 1 &&
    typeof value.sharedRoot === "string" &&
    typeof value.branch === "string" &&
    typeof value.startHead === "string" &&
    typeof value.snapshotTree === "string" &&
    typeof value.sandbox === "string"
  )
}

async function assertUsableSharedRepo(sharedRoot: string) {
  const gitDir = await gitText(sharedRoot, ["rev-parse", "--absolute-git-dir"])
  const blockers = ["rebase-merge", "rebase-apply", "MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD"]

  for (const name of blockers) {
    if (await pathExists(join(gitDir, name))) {
      throw new CommitMyError(`Shared repository has an in-progress ${name.replaceAll("_", " ").toLowerCase()}.`)
    }
  }
}

async function assertNoRebaseInProgress(sandbox: string) {
  const gitDir = await gitText(sandbox, ["rev-parse", "--absolute-git-dir"])

  if ((await pathExists(join(gitDir, "rebase-merge"))) || (await pathExists(join(gitDir, "rebase-apply")))) {
    throw new CommitMyError(
      `Rebase still in progress in the sandbox. Resolve conflicts, git rebase --continue, then commit-my finish.\nsandbox: ${sandbox}`,
    )
  }
}

async function requireRepoRoot(cwd: string) {
  const result = await git(cwd, ["rev-parse", "--show-toplevel"])

  if (result.code !== 0) {
    throw new CommitMyError("Not inside a git repository.")
  }

  return result.stdout
}

async function gitText(cwd: string, args: string[], env: Record<string, string> = {}) {
  const result = await git(cwd, args, env)

  if (result.code !== 0) {
    throw new CommitMyError(result.stderr || result.stdout || `git ${args.join(" ")} failed`)
  }

  return result.stdout
}

async function git(cwd: string, args: string[], env: Record<string, string> = {}): Promise<GitResult> {
  return spawnCommand(cwd, ["git", "-C", cwd, ...args], env)
}

async function spawnCommand(cwd: string, argv: string[], env: Record<string, string> = {}): Promise<GitResult> {
  const proc = Bun.spawn(argv, {
    cwd,
    env: { ...process.env, ...env },
    stdout: "pipe",
    stderr: "pipe",
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

async function pathExists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function resolvePath(cwd: string, path: string) {
  if (isAbsolute(path)) {
    return path
  }

  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2))
  }

  return join(cwd, path)
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
