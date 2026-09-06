---
name: n4bb12-git-commit-my
description: Use when the user asks to commit only this agent's changes, run /git-commit-my, or commit from a shared working tree where other agents may have uncommitted work.
argument-hint: "then -m \"message\" -- path or --patch"
compatibility: Requires git
---

# Commit My

Commit only your changes from a shared working tree. Invoking this skill authorizes staging and committing your in-scope work. Do not ask the user to design the split. Do not modify, restore, stash, or clean the shared working tree. Forgotten work stays there.

## Quick start

1. Run `git-commit-my` and read the entire dirty diff. Find the hunks you wrote, including in files others also touched.
2. One command per commit. Whole files:

```
git-commit-my -m "subject" -- path [path...]
```

Hunks in a file others also touched: cut only your hunks from the review into a `git apply --cached` patch, then:

```
git-commit-my -m "subject" --patch /tmp/yours.diff
```

Paths and `--patch` can go in the same commit. Never `.` or `-A`.

If `git-commit-my` is not on `PATH`, run this skill's `scripts/git-commit-my.ts` with bun.

## What to commit

Same grouping as commit-all: one reason per commit, tests with implementation. Scope is your edits in this session, not every dirty file.

On failure, fix files in the shared tree and re-run the same command. If integrate conflicts, resolve in the printed sandbox, `git rebase --continue`, then `git-commit-my finish`, or `git-commit-my abort`.
