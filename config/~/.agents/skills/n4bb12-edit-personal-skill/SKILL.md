---
name: n4bb12-edit-personal-skill
description: Use when creating or editing a personal skill that must live only in the dotfiles repo. Distinguish from project-local skills in a repository root.
argument-hint: "name or topic of the new personal skill"
---

# Personal Skill Creation

When the user asks you to create a personal (global, agent-agnostic) skill, version it in the dotfiles repo. `bun skills` installs it for agents.

The description field is the only thing the agent harness sees when deciding to load a skill. Keep it short and focused on capability + triggers.

## Quick start

1. Locate the dotfiles repo (usually `~/git/n4bb12/dotfiles`).
2. Pick a kebab-case name.
3. Create the dir only in `dotfiles/config/~/.agents/skills/<name>/`.
4. Write SKILL.md there with a "Use when..." description and agent instructions.
5. From the dotfiles repo, run `bun skills`.
6. Test the skill.

See detailed steps below. Follow `write-a-skill` guidelines for structure and review.

## Core Rules

- **One real file only**: SKILL.md lives in the dotfiles repo under `config/~/.agents/skills/<name>/SKILL.md`.
- Never write the real file in work repos or in live agent skill directories.
- Install with `bun skills` (runs `scripts/install-skills.ts`). Do not create per-agent skill copies.
- Follow progressive disclosure: keep main SKILL.md concise (<100 lines if possible). Split complex content into REFERENCE.md, EXAMPLES.md, or scripts/.
- Writing skills follows TDD: create pressure scenarios (with subagents) that fail without the skill first, then write the minimal skill that makes them pass, then refactor to close loopholes. Never write the skill before seeing the failure.

## Canonical Location

```
<dotfiles-repo>/config/~/.agents/skills/<kebab-name>/SKILL.md
```

Typical on this machine: `/home/n4bb12/git/n4bb12/dotfiles/config/~/.agents/skills/<name>/SKILL.md`

## Steps

1. **Locate the dotfiles repo**
   Usually `~/git/n4bb12/dotfiles`.

2. **Choose a kebab-case name**
   2-64 chars, lowercase letters/digits/hyphens, starts and ends with alphanum (e.g. `stage`, `personal-skill`).

3. **Create directory in dotfiles only**
   ```bash
   DOTFILES=~/git/n4bb12/dotfiles
   NAME=the-name
   mkdir -p "$DOTFILES/config/~/.agents/skills/$NAME"
   ```

4. **Write SKILL.md**
   Path: `$DOTFILES/config/~/.agents/skills/$NAME/SKILL.md`

   Start with short frontmatter. The description MUST be only the triggering conditions (third person, starts with "Use when...", no summary of what the skill does or its process):
   ```markdown
   ---
   name: the-name
   description: Use when the user asks to create a personal skill or add one that must persist in the dotfiles repo.
   argument-hint: "optional"
   ---
   ```

   Body: focused, actionable instructions addressed to the agent. Keep the main file concise; link to REFERENCE.md / EXAMPLES.md / scripts/ for details.

   Follow the template in the `write-a-skill` skill if needed.

5. **Install**
   From the dotfiles repo: `bun skills`.

6. **Test**
   Invoke with the expected phrases and confirm it activates and works.

## Review Checklist

- [ ] Description starts with "Use when..." and ONLY describes triggering conditions (third person, no process summary)
- [ ] SKILL.md body < ~100 lines if possible
- [ ] Body is actionable instructions addressed to the agent
- [ ] No time-sensitive info
- [ ] Tested first with failing pressure scenarios before writing; then verified to pass
- [ ] Installed with `bun skills`

When creating a personal skill, gather requirements first, run baseline tests to see failures, draft the skill, review, write the file, run `bun skills`, then test again.
