import { basename, join } from "node:path"

import { currentBranch, git, gitText, mrPaths, originUrl, resolveBaseRef } from "./git.ts"
import { resolveImageRefs } from "./markdown.ts"
import type { CommandRunner, CurrentRequest, HostKind, Io, Workspace } from "./types.ts"
import { pathExists, readText } from "./workspace.ts"

export async function writeAnalysis(io: Io, workspace: Workspace, hostKind: HostKind, existing?: CurrentRequest) {
  const paths = mrPaths(workspace.repoRoot)
  const baseRef = await resolveBaseRef(workspace.repoRoot, workspace.config.baseBranch, io.runner)
  const sourceBranch = await currentBranch(workspace.repoRoot, io.runner)
  const origin = await originUrl(workspace.repoRoot, io.runner).catch(() => "")
  const status = await gitText(workspace.repoRoot, ["status"], io.runner)
  const log = await gitText(workspace.repoRoot, ["log", "--oneline", `${baseRef}..HEAD`], io.runner).catch(() => "")
  const diffStat = await gitText(workspace.repoRoot, ["diff", "--stat", `${baseRef}...HEAD`], io.runner)
  const diff = await gitText(workspace.repoRoot, ["diff", `${baseRef}...HEAD`], io.runner)
  const description = (await pathExists(paths.description)) ? await readText(paths.description) : ""
  const images = description
    ? await Promise.all(
        resolveImageRefs(description, paths.mrDir).map(async (ref) => ({
          dest: ref.dest,
          kind: ref.kind,
          exists: ref.kind === "remote" ? true : await pathExists(ref.absPath),
        })),
      )
    : []

  const context = await readContextFiles(paths.context)
  const changedFiles = diffStat
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes("|"))

  const analysis = {
    version: 1,
    platform: hostKind,
    origin,
    sourceBranch,
    baseBranch: workspace.config.baseBranch,
    baseRef,
    ahead: log.split("\n").filter(Boolean).length,
    changedFileCount: changedFiles.length,
    status,
    log,
    diffStat,
    diff,
    existingRequest: existing
      ? {
          iid: existing.iid,
          title: existing.title,
          url: existing.url,
          baseBranch: existing.baseBranch,
          description: existing.description,
        }
      : null,
    context,
    descriptionExists: Boolean(description),
    images,
  }

  await Bun.write(paths.analysis, `${JSON.stringify(analysis, null, 2)}\n`)

  return analysis
}

export async function inspectRepo(io: Io, workspace: Workspace, hostKind: HostKind, existing?: CurrentRequest) {
  const analysis = await writeAnalysis(io, workspace, hostKind, existing)
  const dirty = await git(workspace.repoRoot, ["status", "--porcelain"], io.runner)

  io.log(`Inspected ${analysis.changedFileCount} changed files against ${workspace.config.baseBranch}`)
  io.log(`Wrote .mr/analysis.json`)

  if (dirty.stdout.trim()) {
    io.warn("Working tree has uncommitted changes. Description should be based on commits vs the base branch.")
  }

  if (!analysis.ahead) {
    io.warn(`No commits on this branch ahead of ${workspace.config.baseBranch}.`)
  }

  return analysis
}

async function readContextFiles(dir: string) {
  const files: Record<string, string> = {}

  if (!(await pathExists(dir))) {
    return files
  }

  const glob = new Bun.Glob("*")

  for await (const name of glob.scan({ cwd: dir, onlyFiles: true, dot: false })) {
    const path = join(dir, name)

    files[basename(path)] = await readText(path)
  }

  return files
}

export function suggestTitle(branch: string, subjects: string[]) {
  const first = subjects[0]

  if (subjects.length === 1 && first) {
    return first
  }

  const name = branch.replace(/^(feat|fix|chore|docs|refactor|test|ci|build)\//, "")

  return name.replace(/[-_]/g, " ")
}

export async function commitSubjects(repoRoot: string, baseRef: string, runner: CommandRunner) {
  const log = await gitText(repoRoot, ["log", "--format=%s", `${baseRef}..HEAD`], runner).catch(() => "")

  return log.split("\n").filter(Boolean)
}
