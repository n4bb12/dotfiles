---
name: commit-my
description: Use when the user asks to commit only this agent's changes, run /commit-my, or commit from a shared working tree where other agents may have uncommitted work.
argument-hint: "optional scope or commit-message convention"
compatibility: Requires git
---

# Commit My

Commit only your changes from a shared working tree. Create an isolated sandbox first so Lefthook, `tsc`, Biome, tests, and other commit hooks see your commit candidate, not other agents' in-progress files.

Invoking this skill authorizes staging and committing your in-scope work. Do not ask the user to design the split. Do not modify, restore, stash, or clean the shared working tree. Forgotten work stays there.

## Quick start

1. In the shared repo, run `commit-my start` and `cd` into the printed sandbox. All later git and hook commands run there.
2. Stage only your changes: `git add <path>`, `git add -p`, or a cached patch. Never `git add .` or `git add -A`.
3. Run `commit-my isolate` so the sandbox working tree matches the index (`HEAD` + staged).
4. Review `git diff --cached`. Commit with a normal `git commit` so hooks run. Do not bypass hooks.
5. If checks fail, fix in the sandbox, stage, isolate if unstaged noise remains, and commit again.
6. For another atomic commit of your remaining work, run `commit-my refresh`, then repeat from staging.
7. Run `commit-my finish`. It replays your commits onto the current branch tip without touching shared files, then deletes the sandbox.

On rebase conflicts, resolve in the sandbox and `git rebase --continue`, then `commit-my finish` again, or run `commit-my abort`.

If `commit-my` is not on `PATH`, run this skill's `scripts/commit-my.ts` with bun.

## What to commit

Same grouping rules as commit-all: one reason per commit, grouped by semantic purpose, tests with implementation. Scope is **your** edits in this session, not every dirty file. Shared files need hunk selection (`git add -p` or `git apply --cached`).

The sandbox starts with a copy of tracked modifications, deletions, and untracked non-ignored files. Ignored artifacts such as `node_modules` are not copied. Other agents' hunks may still be present until isolate. Leave them unstaged.

## Commands

- `commit-my start`: detached worktree at `HEAD`, copy relevant dirty files, prepare Lefthook if needed
- `commit-my isolate`: `git restore .` and `git clean -fd` in the sandbox
- `commit-my refresh`: restore the original snapshot against current sandbox `HEAD`
- `commit-my finish`: rebase onto the live branch tip if it moved, fast-forward the branch ref, remove the sandbox
- `commit-my abort`: remove the sandbox without integrating
- `commit-my status`: print the active sandbox
