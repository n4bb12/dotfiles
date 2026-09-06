import { createGithubClient } from "./github.ts"
import { createGitlabClient } from "./gitlab.ts"
import type { CommandRunner, HostClient, HostKind } from "./types.ts"

export function createHostClient(kind: HostKind, repoRoot: string, runner: CommandRunner): HostClient {
  if (kind === "github") {
    return createGithubClient(repoRoot, runner)
  }

  return createGitlabClient(repoRoot, runner)
}
