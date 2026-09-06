import { branchExists, originHeadBranch } from "./git.ts"
import { type Io, MrError } from "./types.ts"

const COMMON_BASES = ["main", "master", "develop", "dev", "next", "staging"]

export async function suggestBaseBranches(repoRoot: string, io: Io, extra: string[] = []) {
  const names: string[] = []

  for (const name of extra) {
    pushUnique(names, name)
  }

  const originHead = await originHeadBranch(repoRoot, io.runner)

  if (originHead) {
    pushUnique(names, originHead)
  }

  for (const name of COMMON_BASES) {
    if (
      (await branchExists(repoRoot, `origin/${name}`, io.runner)) ||
      (await branchExists(repoRoot, name, io.runner))
    ) {
      pushUnique(names, name)
    }
  }

  return names
}

export async function pickBaseBranch(io: Io, suggestions: string[], flag?: string) {
  if (flag?.trim()) {
    return flag.trim()
  }

  if (!suggestions.length) {
    throw new MrError("Could not suggest a base branch. Pass --base <branch>.")
  }

  if (!io.stdinTty) {
    throw new MrError(missingBaseMessage(suggestions))
  }

  return io.choose(suggestions, "Base branch")
}

export async function chooseWithGum(io: Io, options: string[], header: string) {
  const gum = io.which("gum")

  if (!gum) {
    throw new MrError(`Install gum or pass --base.\n${formatSuggestions(options)}`)
  }

  const result = await io.runner({
    argv: [gum, "choose", "--header", header, ...options],
    cwd: io.cwd,
    stdinInherit: true,
  })

  if (result.code !== 0 || !result.stdout.trim()) {
    throw new MrError("Base branch selection cancelled.")
  }

  const selected = result.stdout.trim().split("\n")[0]?.trim()

  if (!selected) {
    throw new MrError("Base branch selection cancelled.")
  }

  return selected
}

function missingBaseMessage(suggestions: string[]) {
  return `Pass --base <branch>.\n${formatSuggestions(suggestions)}`
}

function formatSuggestions(suggestions: string[]) {
  return suggestions.map((name) => `  ${name}`).join("\n")
}

function pushUnique(names: string[], name: string) {
  if (!name || names.includes(name)) {
    return
  }

  names.push(name)
}
