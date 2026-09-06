import { type GatewayModelId, gateway, generateText, type LanguageModelCallOptions } from "ai"

const MODEL: GatewayModelId = "google/gemini-3.8-flash"
const REASONING: LanguageModelCallOptions["reasoning"] = "low"

const SYSTEM_PROMPT = `
You write conventional git commit messages.

Return only the commit message. No quotes, no fences, no explanation.

Subject:
Format: <type>[optional scope]: <description>
Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
Imperative present tense, no trailing period, under 72 characters.
Name the edit, not the container. If a function or file already existed and only part of its body changed, name that inner change.
Use feat, add, or implement only when the named thing is newly introduced.
Unchanged context lines (space prefix) and function signatures only locate the edit. The change is the + and - lines.

Body:
Write a blank line after the subject, then a short body, when the change has a why, a remaining constraint, or a caller-facing effect the subject cannot hold.
Wrap body lines at 72 characters. Put new facts in the body, not a restatement of the subject.
Subject only when the subject already describes the whole edit: typos, formatting, renames, one-line chores, lockfile bumps, obvious literal changes.

Examples:

refactor(auth): drop hasPaid check from isEligible

Paid accounts are no longer a requirement. Active and non-banned users
still pass. Callers that assumed payment was required should keep their
own checks.

feat(auth): add isEligible helper

chore: raise request timeout to 8s
`.trim()

export function buildUserPrompt(input: { diff: string; nameStatus: string; recentCommits: string }) {
  const sections = ["Write a commit message for these staged changes."]

  if (input.recentCommits.trim()) {
    sections.push(`## Recent commits\n${input.recentCommits.trim()}`)
  }

  if (input.nameStatus.trim()) {
    sections.push(`## Staged files\n${input.nameStatus.trim()}`)
  }

  sections.push(`## Diff\n${input.diff.trim()}`)

  return sections.join("\n\n")
}

export function cleanCommitMessage(text: string) {
  const message = stripFence(text.trim())
  const lines = message.split("\n")
  const subjectIndex = lines.findIndex((line) => line.trim())

  if (subjectIndex === -1) {
    return ""
  }

  const subjectLine = lines[subjectIndex]

  if (typeof subjectLine !== "string") {
    return ""
  }

  const subject = subjectLine
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\.$/, "")

  const body = lines
    .slice(subjectIndex + 1)
    .join("\n")
    .trim()

  if (!body) {
    return subject
  }

  return `${subject}\n\n${body}`
}

function stripFence(message: string) {
  if (!message.startsWith("```")) {
    return message
  }

  const withoutOpen = message.replace(/^```(?:\w+)?\s*/, "")
  const close = withoutOpen.lastIndexOf("```")

  if (close === -1) {
    return withoutOpen.trim()
  }

  return withoutOpen.slice(0, close).trim()
}

function getModel() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("Please set AI_GATEWAY_API_KEY")
  }

  return gateway(MODEL)
}

async function git(args: string[]) {
  const proc = Bun.spawn(["git", ...args], {
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

async function gitText(args: string[]) {
  const result = await git(args)

  if (result.code !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`)
  }

  return result.stdout
}

async function gitTextOptional(args: string[]) {
  const result = await git(args)

  if (result.code !== 0) {
    return ""
  }

  return result.stdout
}

async function main() {
  const [diff, nameStatus, recentCommits] = await Promise.all([
    gitText(["diff", "--cached", "--no-color", "--no-ext-diff"]),
    gitText(["diff", "--cached", "--name-status"]),
    gitTextOptional(["log", "-8", "--pretty=format:%B"]),
  ])

  if (!diff.trim()) {
    throw new Error("No staged changes found. Please stage your changes before committing.")
  }

  const { text } = await generateText({
    model: getModel(),
    reasoning: REASONING,
    temperature: 0,
    maxOutputTokens: 400,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt({
      diff,
      nameStatus,
      recentCommits,
    }),
  })

  const message = cleanCommitMessage(text)

  if (!message) {
    throw new Error("Model returned an empty commit message.")
  }

  console.log(message)
}

if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
