---
name: stage
description: Use when you need to stage only the changes made by the current agent in a shared working tree where other agents may have edited the same files.
argument-hint: "optional task description for commit context"
compatibility: Requires git
---

# Git Staging for Per-Agent Commits

When the user asks you to stage changes — especially when other agents have been editing the same files in parallel — follow this process to stage *only* your own changes.

## When to Use

Use when you need to commit a clean set of changes from only the current agent's work in a session where multiple agents may have touched overlapping files. This ensures atomic, bisectable commits.

## Quick start

1. Inspect dirty state: `git status --porcelain --untracked-files=no` and `git diff --stat`.
2. Classify files: exclusive to you vs. potentially shared with other agents.
3. Stage exclusive files directly with `git add <path>`.
4. For shared files: produce a compact diff, extract only your hunks into a patch, and stage with `git apply --cached`.
5. Review what will be committed: `git diff --cached --stat`.
6. Confirm the overall on-disk changes (staged + unstaged) still let the project build and test cleanly.
7. Commit the staged set (e.g. using your AI commit helper).

See detailed steps below for mixed files and verification.

## Strict Rules

- **Never** run `git add -A`, `git add .`, `git add -u`, or any broad add that could pull in another agent's work.
- Only stage files and specific hunks that you created or modified in this session.
- For any file that may contain edits from others, use hunk-level selection only.
- The final staged set must result in a logically complete change (together with other in-flight edits on disk, the project should still compile and pass checks).

## Step-by-Step Procedure

### 1. Discover what is dirty right now (cheap commands first)

```bash
git status --porcelain --untracked-files=no
git diff --name-only
git diff --stat
```

These tell you the full picture without flooding context. Use them first.

### 2. Know your own changes

You (the agent) know which files you touched because the edits happened via your tools in this conversation (search_replace, write, terminal edits, etc.).

Cross-reference the list from step 1 with your recent actions.

### 3. Partition files into two buckets

- **Exclusive to you**: You are confident no other agent touched them in this session.
  - Safe: `git add path/to/file.ts`
- **Potentially shared**: Any file where another agent could plausibly have edited lines.
  - Must use selective hunk staging (next step).

New files you introduced count as exclusive (add them explicitly).

### 4. Selective hunk staging for shared files (the important part)

For every file that is not 100% yours:

a. Export a compact, zero-context diff for easy parsing:

   ```bash
   GIT_PAGER=cat git diff --no-color --unified=0 -- "the/file.ts" > "/tmp/diff-$(echo the/file.ts | tr / _).patch"
   ```

b. Read the diff using the most efficient available method:

   - Preferred: use the `read_file` tool on the `/tmp/...patch` file.
   - Alternative: `run_terminal_command` with `cat /tmp/....patch | head -200` (repeat with offset if huge).

c. Locate the `@@ ... @@` hunks that contain **your** edits. Match literal strings, function names, or the exact replacements you performed.

d. Two ways to produce the filtered patch for staging:

   **Option A — Reconstruct (simple when few hunks):**
   Write only the header + the hunks you want using a heredoc:

   ```bash
   cat > /tmp/my-changes.patch << 'PATCHEOF'
   diff --git a/apps/elvent-shop/src/foo.ts b/apps/elvent-shop/src/foo.ts
   --- a/apps/elvent-shop/src/foo.ts
   +++ b/apps/elvent-shop/src/foo.ts
   @@ -42,6 +42,9 @@ export function bar() {
    +    // your added lines here
    +    doTheThing();
   PATCHEOF
   ```

   **Option B — Edit in place (often more precise, leverages your edit tool):**
   - Keep the full exported compact diff.
   - Use the `search_replace` tool (or several calls) directly on the `/tmp/xxx.patch` file to **delete** the hunks and context that do **not** belong to you.
   - Keep the file header lines (`diff --git`, `---`, `+++`, `index`) intact.
   - The resulting file now contains only your hunks.

   This is efficient because you are using the same precise edit capability you used on source code.

   You can combine hunks from one file (or even multiple files if you concatenate properly) into the final patch that gets applied.

e. Apply just that patch to the index (staging area). This leaves the working tree untouched:

   ```bash
   git apply --cached /tmp/my-changes.patch
   ```

f. Verify only your part moved to staged:

   ```bash
   git diff --cached -- "the/file.ts"
   git diff -- "the/file.ts"   # should show the other agent's remaining hunks
   ```

Repeat for every shared file. You can accumulate many small patches or one combined patch.

### 5. Stage your exclusive files and new files

```bash
git add path/you/own.ts path/you/own-too/ new-file-you-created.ts
```

### 6. Review the exact set that will be committed

```bash
git diff --cached --stat
git diff --cached --name-only
# Only when the stat is small and you are sure:
git diff --cached
```

If anything from another agent appears here, unstage and repeat the hunk selection.

Unstage mistakes without touching the working tree:

```bash
git reset HEAD -- path/to/file.ts
```

### 7. Make sure everything is complete (the compile guarantee)

With **all the changes that are currently on disk** (yours + any other agents' uncommitted edits):

- Run the project's standard verification commands (see the repo's AGENTS.md):
  - `bun fix` (format + type check across the monorepo)
  - `bun run test`
  - Any additional `bun run build`, `turbo build`, or app-specific checks.

Fix anything that is in scope for your task.

This satisfies "the change to be complete in the sense that it compiles now, with all the current changes being on disk."

If you want to be extra rigorous that *your commit alone* does not introduce breakage (when other parallel changes are not present):

```bash
git stash push --keep-index -m "other-agents-inflight"
# At this point index == your staged changes only
bun fix && bun run test
git stash pop
```

If the stashed test fails, your change has an undeclared dependency on another agent's edit. Re-scope the tasks.

### 8. Commit (or hand off)

Once the index contains exactly your changes:

- Use the repo's AI commit helper if available: `cmc` (or `git-commit-with-ai`)
- Or `git commit -m "feat(area): concise description of the atomic change"`

The AI commit helper reads `git diff --cached`, so it will only see your precise work.

## Efficiency Notes

- **Never** start by dumping a giant `git diff` of the whole tree. Use `--stat` and name lists.
- For huge diffs, ask the user which subset of files belongs to this agent's task.
- Use `-U0` (no context) when exporting patches for shared files — keeps token usage low.
- Your own edit history in the conversation is often sufficient to identify hunks without re-reading the entire diff. Grep inside the diff when needed:
  ```bash
  git diff --no-color -U0 -- "file" | grep -n -B2 -A5 "UniqueStringYouAdded"
  ```

## Common Pitfalls to Avoid

- Staging an entire file "because most of it is mine".
- Using `git add file` on a shared file.
- Forgetting new files or deleted files that belong to you.
- Committing before running `bun fix` on the full dirty tree.
- Letting one agent's logical change depend on uncommitted lines from another agent without coordinating the order of commits.

## Quick Command Cheat Sheet

```bash
# Inspect
git status --porcelain --untracked-files=no
git diff --stat
git diff --name-only

# Compact diff for one file
GIT_PAGER=cat git diff --no-color -U0 -- path/file.ts

# Safe whole-file stage (exclusive only)
git add path/file.ts

# Selective stage via patch
git apply --cached /tmp/selected-hunks.patch

# Inspect result
git diff --cached --stat
git diff --cached

# Fix a bad stage (working tree stays the same)
git reset HEAD -- path/file.ts
```

Follow the steps above to produce clean, bisect-safe per-agent Git commits.
