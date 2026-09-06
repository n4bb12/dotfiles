---
name: n4bb12-edit-personal-instructions
description: Use when editing the global or personal AGENTS.md (or CLAUDE.md) that lives in the dotfiles repo. Distinguish from any project-local AGENTS.md in a repository root.
argument-hint: "instructions or changes to add to the global agent configuration"
---

# Editing the Personal (Global) Agent File

When the user says "add to my personal agent file", "edit the global AGENTS.md", "update my personal AGENTS.md", or similar, you are working with the **global** version that applies to all projects. This lives in the dotfiles repo.

**Project AGENTS.md** (or CLAUDE.md) lives at the root of the current repository. It is project-specific. Only edit the project one when the user explicitly refers to "this repo's AGENTS.md", "project AGENTS.md", or the local file in the current working directory.

## Quick Start

1. Locate the dotfiles repo (usually `~/git/n4bb12/dotfiles`).
2. Edit the canonical source: `dotfiles/config/~/.agents/AGENTS.md`
3. Check whether the same rule is applicable to the Dorkas monorepo. If it is, add or update the equivalent rule in that repo's root `AGENTS.md` as part of the same task.
4. Make precise, minimal edits that follow the existing structure.
5. Test by having the agent (in a fresh context) acknowledge the change.

## Canonical Location

```
<dotfiles-repo>/config/~/.agents/AGENTS.md
```

Typical path on this machine: `/home/n4bb12/git/n4bb12/dotfiles/config/~/.agents/AGENTS.md`

There may also be a CLAUDE.md in the same directory for Claude-specific global instructions.

Edit that source. Do not create per-agent copies.

## Steps

1. **Locate the dotfiles repo**
   Usually `~/git/n4bb12/dotfiles`.

2. **Decide global vs project**
   - Global/personal: dotfiles version (applies everywhere).
   - Project: the `AGENTS.md` (or `CLAUDE.md`) in the root of the current repo.
   - If the user says "personal", "global", or "my agent file" without mentioning a specific repo → global.
   - If the user says "in this repo", "project AGENTS.md", or gives a path inside a repo → project.

3. **Read the current content**
   Read the canonical source to understand existing sections:
   - Environment
   - General Instructions
   - Skills
   - Plans
   - Output Format
   - UI
   - Defaults
   etc.

4. **Make the edit**
   Use precise `search_replace` (or equivalent) on the **dotfiles source**.
   - Prefer small, targeted changes.
   - Maintain the existing style and section structure.
   - Add new global rules under the appropriate heading.
   - If adding a new top-level section, place it logically.

5. **Sync applicable rules to Dorkas**
   Inspect the root `AGENTS.md` in the Dorkas monorepo (usually
   `~/git/work/dorkas/AGENTS.md`) whenever a global rule is added or changed.
   - If the rule applies to the repo's technologies or workflows, add or update
     the equivalent project rule in the same task.
   - Do not copy rules that are inherently global, machine-specific, or about
     dotfiles and personal-agent setup.
   - Avoid duplication when the project file already expresses the rule, and
     preserve any more specific project wording.
   - If the repo is unavailable, report that the project sync was not performed.

6. **Test the change**
   - Start a fresh agent session.
   - Ask it to summarize the global instructions or acknowledge the new content.
   - Confirm it sees the update (agents reload on file change in many setups).

## Best Practices for Global vs Project Content

**Global (dotfiles) AGENTS.md** — things that should apply to every project and every session:
- Environment (WSL, OS, etc.)
- General principles (smallest change, verify instead of guess)
- Skills configuration (which skill frameworks to prefer, where skills live)
- Plan storage (always the repo's `.agents/plans/`, never only `.cursor/plans/`)
- Output/UI conventions that are personal
- Cross-cutting rules you always want

**Project AGENTS.md** (repo root) — project-specific:
- Tech stack details
- Repo-specific conventions
- Build/test commands
- Architecture notes for this codebase
- Team or repo-specific workflows

Never put project-specific details into the global file.

## Review Checklist

- [ ] Edit was made to the dotfiles source, not a project file
- [ ] Description of the change is minimal and targeted
- [ ] New content is appropriate for global (not project-specific)
- [ ] The changed rule was added to Dorkas when technologically applicable, or
      intentionally left global-only
- [ ] Follows existing style and terminology of the file

When the user asks to "add X to my personal agent file", treat the dotfiles `AGENTS.md` as the single source of truth and follow the steps above.
