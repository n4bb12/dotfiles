---
name: fallow
description: Run Fallow code-health checks sequentially to inspect repo health, dead code, duplicate code, and hotspots. Fix findings and re-run each command until clean before moving on.
---

# Fallow Code Health Skill

Use this skill when asked to inspect or improve repository health using Fallow.

## Goal

Run the configured Fallow checks in order. For each command:

1. Run the command.
2. Review the findings.
3. If there are actionable findings, fix them.
4. Re-run the same command.
5. Repeat until there are no actionable findings or until remaining findings are unsafe/ambiguous to fix.
6. Only then move to the next command.

## Commands

Run these commands in this exact order:

```bash
bunx fallow dead-code --top 5
bunx fallow dupes --mode semantic --min-tokens 50 --top 5
bunx fallow health --hotspots --top 5
```
