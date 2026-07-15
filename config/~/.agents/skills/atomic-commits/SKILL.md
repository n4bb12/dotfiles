---
name: atomic-commits
description: Use when the user wants existing uncommitted repository changes analyzed, split into logical atomic commits, staged, and committed without prescribing the grouping.
argument-hint: "optional scope or commit-message convention"
compatibility: Requires git
---

# Atomic Commits

Turn the repository's current uncommitted work into a fine-grained sequence of coherent commits. Invoking this skill authorizes staging and committing the in-scope changes; do not ask the user to design the split.

## Understand the Change Set

1. Read the repository instructions and inspect `git status --short`, staged and unstaged diff stats, untracked files, and recent commit-message conventions.
2. Inspect the complete diffs and enough surrounding code to understand intent, dependencies, and behavior. Treat staged changes as input, not as a required commit boundary.
3. Treat all current changes as in scope unless the user narrowed the scope. If ownership or scope is genuinely ambiguous, stop before committing and ask.

Never discard or overwrite working-tree changes. Never read secret files merely because they are untracked.

## Design the Commit Sequence

Each commit should represent one reason to change the code: independently understandable, reviewable, and revertible.

- Group changes by semantic purpose, not by file, directory, or time of editing.
- Keep the same mechanical or configuration change across multiple packages together.
- Separate distinct concerns even when they touch the same component or file—for example, visual styling, animation, and form behavior.
- Keep implementation with the tests, types, schemas, migrations, generated artifacts, and documentation required for that implementation.
- Avoid artificial splits such as committing a helper and its sole use separately when they form one feature.
- Order genuinely independent prerequisites before their consumers when that produces useful commits.
- Prefer a slightly larger coherent commit over a smaller commit that is incomplete or misleading.

Plan the groups and their dependency order internally. Do not require the user to approve routine grouping decisions.

## Stage and Commit

For each group:

1. Arrange the index so it contains only that group. Existing staged changes may be safely unstaged for regrouping without altering the working tree.
2. Stage explicit paths when the whole file belongs to the group. When one file contains multiple concerns, stage selected hunks or construct and apply a precise cached patch. Never use broad staging commands such as `git add .` or `git add -A`.
3. Review `git diff --cached --stat` and `git diff --cached`. Confirm the commit is complete, contains no unrelated hunks, and leaves the repository structurally valid for the next commit.
4. Run focused, inexpensive checks when they materially reduce risk. Do not test every historical intermediate commit unless the user asks; use dependency-aware judgment to preserve a buildable sequence by construction.
5. Commit with the repository's message convention and a message describing this commit's single intent. Do not bypass hooks.
6. Reinspect status because hooks may modify files, then continue with the remaining groups.

If intertwined lines cannot be separated safely, keep them in the smallest coherent group. Do not rewrite source code solely to manufacture a commit boundary.

## Finish

Verify that all in-scope changes were committed and unrelated changes remain untouched. Report the commits in order with their short hashes and subjects, plus any deliberately uncommitted files or checks that failed.
