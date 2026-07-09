---
name: personal-skill
description: Use when creating or adding a personal skill that must live only in the dotfiles repo and be symlinked into agent skill directories for availability across tools.
argument-hint: "name or topic of the new personal skill"
---

# Personal Skill Creation

When the user asks you to create a personal (global, agent-agnostic) skill, follow this process to ensure it is versioned in the dotfiles repo and available everywhere.

The description field is the only thing the agent harness sees when deciding to load a skill. Keep it short and focused on capability + triggers.

## Quick start

1. Locate your dotfiles repo (usually `~/git/n4bb12/dotfiles`).
2. Pick a kebab-case name.
3. Create dir only in `dotfiles/config/~/.agents/skills/<name>/`.
4. Write SKILL.md there with short description (what + "Use when...") and agent instructions.
5. Symlink the skill dir from `~/.agents/skills/`, `~/.claude/skills/`, `~/.grok/skills/` (and optionally cursor) directly to that dir.
6. Verify symlinks and test the skill.

See detailed steps and template below. Follow `write-a-skill` guidelines for structure and review.

## Core Rules

- **One real file only**: the SKILL.md must live in the dotfiles repo under `config/~/.agents/skills/<name>/SKILL.md`.
- Live locations (~/.agents/skills/, ~/.claude/skills/, ~/.grok/skills/, optionally ~/.cursor/skills/) are **direct symlinks** only.
- Never write the real file in work repos, ~/.agents/skills/, or other live dirs.
- Follow progressive disclosure: keep main SKILL.md concise (<100 lines if possible). Split complex content into REFERENCE.md, EXAMPLES.md, or scripts/.
- Writing skills follows TDD: create pressure scenarios (with subagents) that fail without the skill first, then write the minimal skill that makes them pass, then refactor to close loopholes. Never write the skill before seeing the failure.

## Canonical Location

The single source of truth:

```
<dotfiles-repo>/config/~/.agents/skills/<kebab-name>/SKILL.md
```

Typical on this machine: `/home/n4bb12/git/n4bb12/dotfiles/config/~/.agents/skills/<name>/SKILL.md`

## Live Symlinks

Create direct symlinks (use `ln -sfn`):

- `~/.agents/skills/<name>` → canonical dir
- `~/.claude/skills/<name>` → canonical dir
- `~/.grok/skills/<name>` → canonical dir
- (optional) `~/.cursor/skills/<name>`

Point them directly at the skill directory containing the real SKILL.md.

## Steps

1. **Locate the dotfiles repo**
   Usually `~/git/n4bb12/dotfiles`. Discover reliably:
   ```bash
   readlink -f ~/.agents/AGENTS.md | sed 's|/config/~/.agents/AGENTS.md||'
   ```

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
   description: Use when the user asks to create a personal skill or add one that must persist in the dotfiles with symlinks.
   argument-hint: "optional"
   ---
   ```

   Body: focused, actionable instructions addressed to the agent (not documentation for humans). Use progressive disclosure — keep main file concise; link to REFERENCE.md / EXAMPLES.md / scripts/ for details.

   Follow the template in the `write-a-skill` skill if needed.

5. **Create direct live symlinks**
   ```bash
   ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.agents/skills/$NAME
   ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.claude/skills/$NAME
   ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.grok/skills/$NAME
   # optional
   mkdir -p ~/.cursor/skills
   ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.cursor/skills/$NAME
   ```

6. **Verify**
   Check symlinks point to dotfiles, read the file, run `grok inspect` if available.

7. **Test**
   Invoke with the expected phrases and confirm it activates and works.

## Template

```bash
DOTFILES=~/git/n4bb12/dotfiles
NAME="example-skill"

mkdir -p "$DOTFILES/config/~/.agents/skills/$NAME"

cat > "$DOTFILES/config/~/.agents/skills/$NAME/SKILL.md" << 'EOF'
---
name: example-skill
description: Use when the user asks to create a personal skill or add one that must persist in the dotfiles with symlinks.
---
# Example Skill

Concise instructions for the agent.

## Quick start
[minimal example]

## Workflows
[step by step]

See REFERENCE.md for details if needed.
EOF

ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.agents/skills/$NAME
ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.claude/skills/$NAME
ln -sfn "$DOTFILES/config/~/.agents/skills/$NAME" ~/.grok/skills/$NAME

ls -l ~/.agents/skills/$NAME
```

## Review Checklist (from writing-skills best practices)

- [ ] Description starts with "Use when..." and ONLY describes triggering conditions/situations (third person, no "what it does" or process summary)
- [ ] SKILL.md body < ~100 lines if possible (split if needed for progressive disclosure)
- [ ] Body uses clear sections: Overview, When to Use, Core Pattern/Steps, Common Mistakes, etc.
- [ ] Body is actionable instructions addressed to the agent (use "you")
- [ ] Concrete examples and quick reference included
- [ ] No time-sensitive info
- [ ] Consistent terminology; good keywords for discovery
- [ ] Symlinks point only to dotfiles source
- [ ] Tested first with failing pressure scenarios (subagents) before writing; then verified to pass
- [ ] Follows TDD cycle for the skill itself (RED: baseline failure without skill; GREEN: minimal skill; REFACTOR: close loopholes)

When creating a personal skill, gather requirements first, run baseline tests to see failures, draft the skill, review, write the file and symlinks, then test again.
