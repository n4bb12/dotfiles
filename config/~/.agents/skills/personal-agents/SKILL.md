---
name: personal-agents
description: Use when editing the global or personal AGENTS.md (or CLAUDE.md) that lives in the dotfiles repo and is symlinked for availability across agents. Distinguish from any project-local AGENTS.md in a repository root.
argument-hint: "instructions or changes to add to the global agent configuration"
---

# Editing the Personal (Global) Agent File

When the user says "add to my personal agent file", "edit the global AGENTS.md", "update my personal AGENTS.md", or similar, you are working with the **global** version that applies to all projects. This lives in the dotfiles repo and is symlinked so every agent (Grok, Claude, etc.) sees it.

**Project AGENTS.md** (or CLAUDE.md) lives at the root of the current repository. It is project-specific. Only edit the project one when the user explicitly refers to "this repo's AGENTS.md", "project AGENTS.md", or the local file in the current working directory.

## Quick Start

1. Locate the dotfiles repo (usually `~/git/n4bb12/dotfiles`).
2. Edit the canonical source: `dotfiles/config/~/.agents/AGENTS.md`
3. Verify or recreate symlinks if needed:
   - `~/AGENTS.md` → dotfiles source (absolute)
   - `~/.agents/AGENTS.md` → dotfiles source (absolute)
   - `~/.claude/AGENTS.md` → dotfiles source (absolute)
4. Make precise, minimal edits that follow the existing structure.
5. Test by having the agent (in a fresh context) acknowledge the change.

## Canonical Location

Single source of truth:

```
<dotfiles-repo>/config/~/.agents/AGENTS.md
```

Typical path on this machine: `/home/n4bb12/git/n4bb12/dotfiles/config/~/.agents/AGENTS.md`

There may also be a CLAUDE.md in the same directory for Claude-specific global instructions.

## Live Symlinks

The global files the agents actually read are symlinks pointing to the dotfiles source:

- `~/AGENTS.md`
- `~/.agents/AGENTS.md`
- `~/.claude/AGENTS.md`

(And sometimes others like `~/.grok/AGENTS.md`.)

Always edit the source in dotfiles, then ensure the symlinks point correctly. Use `ln -sfn` for safety.

## Steps

1. **Locate the dotfiles repo**
   ```bash
   readlink -f ~/AGENTS.md | sed 's|/config/~/.agents/AGENTS.md||'
   ```
   Usually `~/git/n4bb12/dotfiles`.

2. **Decide global vs project**
   - Global/personal: dotfiles version (applies everywhere).
   - Project: the `AGENTS.md` (or `CLAUDE.md`) in the root of the current repo.
   - If the user says "personal", "global", or "my agent file" without mentioning a specific repo → global.
   - If the user says "in this repo", "project AGENTS.md", or gives a path inside a repo → project.

3. **Read the current content**
   Use `read_file` on the canonical source (or the symlinked path if easier) to understand existing sections:
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

5. **Verify symlinks**
   ```bash
   ls -l ~/AGENTS.md ~/.agents/AGENTS.md ~/.claude/AGENTS.md
   readlink -f ~/AGENTS.md
   ```
   Fix any that are broken:
   ```bash
   DOTFILES=~/git/n4bb12/dotfiles
   ln -sfn "$DOTFILES/config/~/.agents/AGENTS.md" ~/AGENTS.md
   ln -sfn "$DOTFILES/config/~/.agents/AGENTS.md" ~/.agents/AGENTS.md
   ln -sfn "$DOTFILES/config/~/.agents/AGENTS.md" ~/.claude/AGENTS.md
   ```

6. **Test the change**
   - Start a fresh agent session.
   - Ask it to summarize the global instructions or acknowledge the new content.
   - Confirm it sees the update (agents reload on file change in many setups).

## Best Practices for Global vs Project Content

**Global (dotfiles) AGENTS.md** — things that should apply to every project and every session:
- Environment (WSL, OS, etc.)
- General principles (smallest change, verify instead of guess)
- Skills configuration (which skill frameworks to prefer, where skills live)
- Plan storage defaults (e.g., `.cursor/plans/`)
- Output/UI conventions that are personal
- Cross-cutting rules you always want

**Project AGENTS.md** (repo root) — project-specific:
- Tech stack details
- Repo-specific conventions
- Build/test commands
- Architecture notes for this codebase
- Team or repo-specific workflows

Never put project-specific details into the global file.

## Template for Common Additions

When the user wants to add a rule:

```markdown
## New Section Title

- Bullet point describing the rule
- Another point with example if helpful
```

Place it under the most relevant existing top-level section, or create a new one if it doesn't fit.

## Review Checklist

- [ ] Edit was made to the dotfiles source, not a project file
- [ ] Description of the change is minimal and targeted
- [ ] Symlinks still point to the dotfiles version
- [ ] New content is appropriate for global (not project-specific)
- [ ] Tested in a fresh agent session
- [ ] Follows existing style and terminology of the file

When the user asks to "add X to my personal agent file", treat the dotfiles `AGENTS.md` as the single source of truth and follow the steps above.
