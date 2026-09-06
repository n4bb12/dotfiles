---
name: n4bb12-merge-request
description: Use when the user wants to create or update a GitHub pull request or GitLab merge request, run /mr, or prepare a local .merge-request description.
argument-hint: "init | inspect | create | update"
compatibility: Requires git, bun, and gh or glab
---

# Merge request

Prepare a local MR/PR description, then create or update it on GitHub or GitLab. Git is the source of truth. `.merge-request/context/` is extra. The CLI does git, workspace, and host APIs. You write `.merge-request/description.md`.

## Commands

From any repo, after aliases are sourced: `mr <command>`. Otherwise `bun <dotfiles>/scripts/mr/cli.ts <command>`.

```
mr init --base <branch>
mr inspect
mr status
mr render
mr create
mr update
```

`mr init` without `--base` asks in a TTY. Agents pass `--base`. Delete `.merge-request/` to reset the base branch.

## Steps

1. Run `mr init --base <branch>` unless `.merge-request/config.json` already exists. Completion: `.merge-request/` exists with `config.json` and `analysis.json`.
2. Read `.merge-request/analysis.json` and verify against `git status`, `git log <base>..HEAD`, `git diff --stat <base>...HEAD`, and `git diff <base>...HEAD`. Completion: every claim you will write is backed by that diff.
3. Write or update `.merge-request/description.md` for a reviewer: what changed for users, why, which areas, relevant technical choices, how it was tested. Group large diffs thematically. Image links only when a visual comparison helps, as `./screenshots/….png` relative to this file, plus concrete capture instructions for the human. Completion: the file is previewable locally and does not invent URLs, testdata, or UI states.
4. If images are listed, tell the user to put them in `.merge-request/screenshots/` and run `mr status`. Completion: `mr status` exits 0, or there are no local images.
5. Let the user review `.merge-request/description.md`. On request run `mr create` or `mr update`. Do not push, force-push, or merge.

See [scripts/mr/README.md](../../../../../scripts/mr/README.md) for files, `glab`/`gh` auth, and the upload cache.
