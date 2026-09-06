import { describe, expect, test } from "bun:test"

import { buildUserPrompt, cleanCommitMessage } from "./git-commit-ai.ts"

const REMOVE_CONDITION_DIFF = `diff --git a/src/auth.ts b/src/auth.ts
index 1111111..2222222 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,7 +10,6 @@ export function isEligible(user: User) {
   return (
     user.active &&
-    user.hasPaid &&
     !user.banned
   )
 }
`

describe("buildUserPrompt", () => {
  test("sends the staged diff without a reformatted delta", () => {
    expect(
      buildUserPrompt({
        recentCommits: "fix(auth): reject banned users\n\nBanned users failed open.\nfeat(auth): add isEligible helper",
        nameStatus: "M\tsrc/auth.ts",
        diff: REMOVE_CONDITION_DIFF,
      }),
    ).toMatchInlineSnapshot(`
      "Write a commit message for these staged changes.

      ## Recent commits
      fix(auth): reject banned users

      Banned users failed open.
      feat(auth): add isEligible helper

      ## Staged files
      M	src/auth.ts

      ## Diff
      diff --git a/src/auth.ts b/src/auth.ts
      index 1111111..2222222 100644
      --- a/src/auth.ts
      +++ b/src/auth.ts
      @@ -10,7 +10,6 @@ export function isEligible(user: User) {
         return (
           user.active &&
      -    user.hasPaid &&
           !user.banned
         )
       }"
    `)
  })
})

describe("cleanCommitMessage", () => {
  test("keeps a plain conventional subject", () => {
    expect(cleanCommitMessage("refactor(auth): drop hasPaid check from isEligible")).toMatchInlineSnapshot(
      `"refactor(auth): drop hasPaid check from isEligible"`,
    )
  })

  test("keeps a subject and body", () => {
    expect(
      cleanCommitMessage(`refactor(auth): drop hasPaid check from isEligible

Paid accounts are no longer a requirement. Active and non-banned users
still pass.`),
    ).toMatchInlineSnapshot(`
      "refactor(auth): drop hasPaid check from isEligible

      Paid accounts are no longer a requirement. Active and non-banned users
      still pass."
    `)
  })

  test("strips fences, quotes, and a trailing period on the subject", () => {
    expect(
      cleanCommitMessage(`
\`\`\`
"refactor(auth): drop hasPaid check from isEligible."

Paid accounts are no longer a requirement.
\`\`\`

because the paid check is gone
`),
    ).toMatchInlineSnapshot(`
      "refactor(auth): drop hasPaid check from isEligible

      Paid accounts are no longer a requirement."
    `)
  })
})
