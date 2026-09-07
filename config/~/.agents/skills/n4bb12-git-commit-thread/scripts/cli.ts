#!/usr/bin/env bun

import { dirname, isAbsolute, join, relative } from "node:path"
import { $ } from "bun"

const STATE_NAME = "state.json"

const USAGE = `Usage: git-commit-thread
       git-commit-thread show -- <path>...
       git-commit-thread -m <message> [--patch <file>] [--] <path>...
       git-commit-thread <command> [sandbox] [--json]

With no arguments, print dirty paths and diff stats.
Then commit your files and/or a hunk patch. Other dirty files stay put.

  show            Print diffs for the given paths only
  -m, --message   Commit message (repeat for paragraphs)
  --patch <file>  Stage this git apply --cached patch (your hunks in mixed files)

Commands:
  start     Create an isolated worktree sandbox and copy dirty files into it
  isolate   Drop unstaged sandbox changes so the worktree matches the index
  refresh   Restore remaining snapshot files after a sandbox commit
  finish    Replay sandbox commits onto the current branch tip and delete the sandbox
  abort     Delete the sandbox without integrating
  status    Show the active sandbox
  help      Show this help

The shared working tree is never modified. Only finish updates the branch ref.`

export class GitCommitThreadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GitCommitThreadError"
  }
}

type GitCommitThreadState = {
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
  const { command, sandboxArg, json, messages, paths, patch } = parseArgs(argv)

  if (command === "help") {
    log(USAGE)
    return
  }

  if (!command) {
    await review(ctx)
    return
  }

  switch (command) {
    case "commit":
      await commitPaths(ctx, messages, paths, patch)
      return
    case "review":
      await review(ctx)
      return
    case "show":
      await show(ctx, paths)
      return
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
      throw new GitCommitThreadError(`Unknown command: ${command}\n\n${USAGE}`)
  }
}

function parseArgs(argv: string[]) {
  const messages: string[] = []
  const positional: string[] = []
  let json = false
  let patch: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (typeof arg !== "string") {
      break
    }

    if (arg === "--") {
      positional.push(...argv.slice(i + 1))
      break
    }

    if (arg === "--json") {
      json = true
      continue
    }

    if (arg === "-h" || arg === "--help") {
      return { command: "help", json, messages, paths: [], patch: undefined, sandboxArg: undefined }
    }

    if (arg === "-m" || arg === "--message") {
      const value = argv[i + 1]

      if (typeof value !== "string") {
        throw new GitCommitThreadError(`Missing message after ${arg}`)
      }

      messages.push(value)
      i++
      continue
    }

    if (arg === "--patch") {
      const value = argv[i + 1]

      if (typeof value !== "string") {
        throw new GitCommitThreadError("Missing file after --patch")
      }

      patch = value
      i++
      continue
    }

    if (arg.startsWith("-")) {
      throw new GitCommitThreadError(`Unknown option: ${arg}\n\n${USAGE}`)
    }

    positional.push(arg)
  }

  if (patch && !messages.length) {
    throw new GitCommitThreadError("git-commit-thread --patch requires -m")
  }

  if (messages.length) {
    return {
      command: "commit",
      json,
      messages,
      paths: positional,
      patch,
      sandboxArg: undefined,
    }
  }

  return {
    command: positional[0],
    json,
    messages,
    paths: positional.slice(1),
    patch: undefined,
    sandboxArg: positional[1],
  }
}

async function review(io: Io) {
  const sharedRoot = await requireRepoRoot(io.cwd)
  const statusText = await gitText(sharedRoot, ["status", "--short"])

  if (!statusText) {
    io.log("working tree clean")
    return
  }

  io.log(statusText)

  const stat = await git(sharedRoot, ["diff", "HEAD", "--stat"])

  if (stat.stdout) {
    io.log("")
    io.log(stat.stdout)
  }
}

async function show(io: Io, paths: string[]) {
  if (!paths.length) {
    throw new GitCommitThreadError("git-commit-thread show requires paths")
  }

  assertSafePaths(paths)

  const sharedRoot = await requireRepoRoot(io.cwd)
  const relPaths = paths.map((path) => repoRelativePath(io.cwd, sharedRoot, path))
  const tracked = await git(sharedRoot, ["diff", "HEAD", "--", ...relPaths])
  let printed = false

  if (tracked.stdout) {
    io.log(tracked.stdout)
    printed = true
  }

  const untracked = await gitText(sharedRoot, ["ls-files", "--others", "--exclude-standard", "--", ...relPaths])

  for (const file of untracked.split("\n").filter(Boolean)) {
    const diff = await git(sharedRoot, ["diff", "--no-index", "--", "/dev/null", file])
    const text = diff.stdout || diff.stderr

    if (!text) {
      continue
    }

    if (printed) {
      io.log("")
    }

    io.log(text)
    printed = true
  }
}

async function commitPaths(io: Io, messages: string[], paths: string[], patch?: string) {
  assertSafePaths(paths, patch)

  const sharedRoot = await requireRepoRoot(io.cwd)
  const relPaths = paths.map((path) => repoRelativePath(io.cwd, sharedRoot, path))
  const patchFile = patch ? resolvePath(io.cwd, patch) : undefined

  if (patchFile && !(await pathExists(patchFile))) {
    throw new GitCommitThreadError(`Patch not found: ${patch}`)
  }

  const state = await start(io, false, true)

  let keepSandbox = false

  try {
    if (relPaths.length) {
      await gitText(state.sandbox, ["add", "--", ...relPaths])
    }

    if (patchFile) {
      const applied = await git(state.sandbox, ["apply", "--cached", "--", patchFile])

      if (applied.code !== 0) {
        throw new GitCommitThreadError(applied.stderr || applied.stdout || "git apply --cached failed")
      }
    }

    await isolateSandbox(state)

    const staged = await git(state.sandbox, ["diff", "--cached", "--quiet"])

    if (staged.code === 0) {
      throw new GitCommitThreadError("Nothing staged. Check that the paths or patch match this working tree.")
    }

    await bunInstall(state.sandbox)
    await quietLefthook(state.sandbox)

    const messageArgs = messages.flatMap((message) => ["-m", message])
    const committed = await gitHooked(state.sandbox, ["commit", "-q", ...messageArgs])

    if (committed.code !== 0) {
      throw new GitCommitThreadError(commandOutput(committed) || "git commit failed")
    }

    keepSandbox = true
    await finish(io, state.sandbox)
  } catch (error) {
    if (!keepSandbox) {
      await removeSandbox(state.sharedRoot, state.sandbox)
    }

    throw error
  }
}

async function start(io: Io, json: boolean, silent = false) {
  const sharedRoot = await requireRepoRoot(io.cwd)

  await assertUsableSharedRepo(sharedRoot)

  const branch = await gitText(sharedRoot, ["rev-parse", "--abbrev-ref", "HEAD"])

  if (branch === "HEAD") {
    throw new GitCommitThreadError("git-commit-thread requires a branch. The shared repository is in detached HEAD.")
  }

  const startHead = await gitText(sharedRoot, ["rev-parse", "HEAD"])
  const snapshotTree = await writeSnapshotTree(sharedRoot)
  const sandboxRoot = await makeTempDir("git-commit-thread-")
  const sandbox = join(sandboxRoot, "work")

  const state: GitCommitThreadState = {
    version: 1,
    sharedRoot,
    branch,
    startHead,
    snapshotTree,
    sandbox,
  }

  try {
    await gitText(sharedRoot, ["worktree", "add", "--detach", sandbox, startHead])
    await gitText(sandbox, ["restore", "--source", snapshotTree, "--worktree", "--no-overlay", "--", "."])
    await prepareSandboxTooling(sharedRoot, sandbox)
    await writeState(sandbox, state)
  } catch (error) {
    await removeSandbox(sharedRoot, sandbox)
    await removeDir(sandboxRoot)
    throw error
  }

  if (silent) {
    return state
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
    return state
  }

  io.log(`git-commit-thread sandbox ready`)
  io.log(`sandbox: ${sandbox}`)
  io.log(`branch: ${branch}`)
  io.log(`head: ${startHead}`)

  return state
}

async function isolate(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await isolateSandbox(state)

  const statusText = await gitText(state.sandbox, ["status", "--short"])

  io.log(statusText || "sandbox working tree matches the index")
}

async function isolateSandbox(state: GitCommitThreadState) {
  await gitText(state.sandbox, ["restore", "."])
  await gitText(state.sandbox, ["clean", "-fd", "--exclude=node_modules"])
  await prepareSandboxTooling(state.sharedRoot, state.sandbox)
}

async function refresh(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await gitText(state.sandbox, ["restore", "--source", state.snapshotTree, "--worktree", "--no-overlay", "--", "."])
  await prepareSandboxTooling(state.sharedRoot, state.sandbox)

  const statusText = await gitText(state.sandbox, ["status", "--short"])

  io.log(statusText || "no remaining snapshot changes")
}

async function finish(io: Io, sandboxArg?: string) {
  const state = await loadState(io, sandboxArg)

  await assertNoRebaseInProgress(state.sandbox)

  const sandboxHead = await gitText(state.sandbox, ["rev-parse", "HEAD"])

  if (sandboxHead === state.startHead) {
    throw new GitCommitThreadError("No commits in the sandbox. Commit first, or run git-commit-thread abort.")
  }

  const currentHead = await gitText(state.sharedRoot, ["rev-parse", state.branch])

  if (sandboxHead === currentHead) {
    await removeSandbox(state.sharedRoot, state.sandbox)
    io.log("nothing to integrate")
    return
  }

  const mergeBase = await gitText(state.sandbox, ["merge-base", sandboxHead, currentHead])

  if (mergeBase !== currentHead) {
    await quietLefthook(state.sandbox)
    const result = await gitHooked(state.sandbox, ["rebase", "--onto", currentHead, mergeBase])

    if (result.code !== 0) {
      throw new GitCommitThreadError(
        [
          "Rebase conflict while integrating onto the current branch tip.",
          "Resolve the conflict in the sandbox, then run git rebase --continue and git-commit-thread finish.",
          "Or run git-commit-thread abort to drop the sandbox.",
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
      throw new GitCommitThreadError(
        [
          "Branch moved while integrating. Re-run git-commit-thread finish.",
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
  const indexDir = await makeTempDir("git-commit-thread-index-")
  const indexPath = join(indexDir, "index")

  try {
    await gitText(sharedRoot, ["read-tree", "HEAD"], { GIT_INDEX_FILE: indexPath })
    await gitText(sharedRoot, ["add", "-A"], { GIT_INDEX_FILE: indexPath })
    return await gitText(sharedRoot, ["write-tree"], { GIT_INDEX_FILE: indexPath })
  } finally {
    await removeDir(indexDir)
  }
}

async function prepareSandboxTooling(sharedRoot: string, sandbox: string) {
  await linkPackageNodeModules(sharedRoot, sandbox)
}

async function bunInstall(sandbox: string) {
  if (!(await pathExists(join(sandbox, "package.json")))) {
    return
  }

  const result = await spawnCommand(sandbox, [process.execPath, "install", "--silent"])

  if (result.code !== 0) {
    throw new GitCommitThreadError(result.stderr || result.stdout || "bun install failed")
  }
}

const LEFTHOOK_CONFIGS = ["lefthook.yml", "lefthook.yaml", ".lefthook.yml", ".lefthook.yaml"] as const

async function quietLefthook(sandbox: string) {
  // Lefthook 2 applies LEFTHOOK_OUTPUT first, then cfg.Output. A missing
  // `output` key is nil and turns every section back on, so the env is a no-op.
  let found = false

  for (const name of LEFTHOOK_CONFIGS) {
    if (await pathExists(join(sandbox, name))) {
      found = true
      break
    }
  }

  if (!found) {
    return
  }

  const localPath = join(sandbox, "lefthook-local.yml")
  const quiet = "output: false\n"

  if (await pathExists(localPath)) {
    const existing = await Bun.file(localPath).text()

    if (/(^|\n)output:\s*false\s*(\n|$)/.test(existing)) {
      return
    }

    await Bun.write(localPath, `${existing.trimEnd()}\n\n${quiet}`)
    return
  }

  await Bun.write(localPath, quiet)
}

function assertSafePaths(paths: string[], patch?: string) {
  if (!paths.length && !patch) {
    throw new GitCommitThreadError('Pass explicit paths or --patch. Example: git-commit-thread -m "message" -- path')
  }

  for (const path of paths) {
    const normalized = path.replaceAll("\\", "/").replace(/\/+$/, "") || "."

    if (
      normalized === "." ||
      normalized === "-A" ||
      normalized === "--all" ||
      normalized === "*" ||
      normalized === "-u"
    ) {
      throw new GitCommitThreadError(`Refusing to stage ${path}. Pass explicit file paths.`)
    }
  }
}

function repoRelativePath(cwd: string, repoRoot: string, path: string) {
  const abs = resolvePath(cwd, path)
  const rel = relative(repoRoot, abs)

  if (!rel || rel === "." || rel.startsWith("..") || isAbsolute(rel)) {
    throw new GitCommitThreadError(`Path is outside the repository: ${path}`)
  }

  return rel
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

    await ensureDir(dirname(dest))
    await $`ln -sfn ${source} ${dest}`.quiet()
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
    await removeDir(sandbox)
    await git(sharedRoot, ["worktree", "prune"])
  }

  await removeDir(dirname(sandbox))
}

async function loadState(io: Io, sandboxArg?: string): Promise<GitCommitThreadState> {
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
    throw new GitCommitThreadError(`Multiple git-commit-thread sandboxes exist. Pass one:\n${paths}`)
  }

  throw new GitCommitThreadError("No git-commit-thread sandbox found. Run git-commit-thread start first.")
}

async function listSandboxes(sharedRoot: string) {
  const porcelain = await gitText(sharedRoot, ["worktree", "list", "--porcelain"])
  const found: GitCommitThreadState[] = []

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

async function writeState(sandbox: string, state: GitCommitThreadState) {
  const gitDir = await gitText(sandbox, ["rev-parse", "--absolute-git-dir"])
  await Bun.write(join(gitDir, STATE_NAME), `${JSON.stringify(state, null, 2)}\n`)
}

async function readState(sandbox: string) {
  const state = await readStateIfPresent(sandbox)

  if (!state) {
    throw new GitCommitThreadError(`Not a git-commit-thread sandbox: ${sandbox}`)
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

  const parsed: unknown = JSON.parse(await Bun.file(statePath).text())

  if (!isState(parsed)) {
    throw new GitCommitThreadError(`Invalid git-commit-thread state at ${statePath}`)
  }

  return parsed
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isState(value: unknown): value is GitCommitThreadState {
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
      throw new GitCommitThreadError(`Shared repository has an in-progress ${name.replaceAll("_", " ").toLowerCase()}.`)
    }
  }
}

async function assertNoRebaseInProgress(sandbox: string) {
  const gitDir = await gitText(sandbox, ["rev-parse", "--absolute-git-dir"])

  if ((await pathExists(join(gitDir, "rebase-merge"))) || (await pathExists(join(gitDir, "rebase-apply")))) {
    throw new GitCommitThreadError(
      `Rebase still in progress in the sandbox. Resolve conflicts, git rebase --continue, then git-commit-thread finish.\nsandbox: ${sandbox}`,
    )
  }
}

async function requireRepoRoot(cwd: string) {
  const result = await git(cwd, ["rev-parse", "--show-toplevel"])

  if (result.code !== 0) {
    throw new GitCommitThreadError("Not inside a git repository.")
  }

  return result.stdout
}

function commandOutput(result: GitResult) {
  return [result.stderr, result.stdout].filter(Boolean).join("\n")
}

async function gitText(cwd: string, args: string[], env: Record<string, string> = {}) {
  const result = await git(cwd, args, env)

  if (result.code !== 0) {
    throw new GitCommitThreadError(commandOutput(result) || `git ${args.join(" ")} failed`)
  }

  return result.stdout
}

async function git(cwd: string, args: string[], env: Record<string, string> = {}): Promise<GitResult> {
  return spawnCommand(cwd, ["git", "-C", cwd, ...args], env)
}

async function gitHooked(cwd: string, args: string[], env: Record<string, string> = {}) {
  const gitArgv = ["git", "-C", cwd, ...args]
  return spawnCommand(cwd, await withoutControllingTty(gitArgv), env)
}

let canDetachTty: boolean | undefined

async function withoutControllingTty(argv: string[]) {
  if (canDetachTty === undefined) {
    const probe = await spawnCommand(tmpDir(), ["setsid", "-w", "true"])
    canDetachTty = probe.code === 0
  }

  if (!canDetachTty) {
    return argv
  }

  return ["setsid", "-w", ...argv]
}

async function spawnCommand(cwd: string, argv: string[], env: Record<string, string> = {}): Promise<GitResult> {
  const proc = Bun.spawn(argv, {
    cwd,
    env: { ...process.env, ...env },
    stdin: "ignore",
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
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0
}

async function makeTempDir(prefix: string) {
  const created = (await $`mktemp -d ${join(tmpDir(), `${prefix}XXXXXX`)}`.quiet().text()).trim()

  if (!created) {
    throw new GitCommitThreadError("mktemp failed")
  }

  return created
}

async function ensureDir(path: string) {
  await $`mkdir -p ${path}`.quiet()
}

async function removeDir(path: string) {
  await $`rm -rf ${path}`.nothrow().quiet()
}

function tmpDir() {
  return Bun.env.TMPDIR || "/tmp"
}

function homeDir() {
  return Bun.env.HOME || tmpDir()
}

function resolvePath(cwd: string, path: string) {
  if (isAbsolute(path)) {
    return path
  }

  if (path.startsWith("~/")) {
    return join(homeDir(), path.slice(2))
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
