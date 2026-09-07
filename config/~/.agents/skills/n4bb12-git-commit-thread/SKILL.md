---
name: n4bb12-git-commit-thread
description: Use when the user asks to commit only this agent's changes, run /git-commit-thread, or commit from a shared working tree where other agents may have uncommitted work.
argument-hint: "then -m \"message\" -- path or --patch"
compatibility: Requires git
---

# Git Commit Thread

This skill replaces the default commit protocol. Skip `git status`, `git diff`, and `git log`. The only git command is `git-commit-thread`.

Commit only the files you edited in this session. Invoking this skill authorizes staging and committing that work. Name your files from this conversation. Do not open AGENTS.md, commit-all, the CLI source, or other files to rebuild the diff.

1. `git-commit-thread` prints dirty paths and stats. Keep yours. Skip the rest.
2. Whole files you own:

```
git-commit-thread -m "type: subject" -- path [path...]
```

If a file's stat is larger than your edits, `git-commit-thread show -- path` (that path only), then your hunks:

```
git-commit-thread -m "type: subject" --patch /tmp/yours.diff
```

Never `.` or `-A`. One reason per commit, tests with implementation. Conventional subject, body unless trivial, name the edit not the container.

On hook failure, fix the shared tree and re-run. On integrate conflict, resolve in the printed sandbox, `git rebase --continue`, then `git-commit-thread finish`, or `git-commit-thread abort`.

If `git-commit-thread` is not on `PATH`, run this skill's `scripts/cli.ts` with bun.
