# Configuration Files

Some of these need to be installed manually into the appropriate locations.

## Agents

```
rm -rf ~/.agents/skills
mkdir -p ~/.agents/skills
ln -sfn config/~/.agents/skills ~/.agents/skills

rm -rf ~/.copilot/skills
mkdir -p ~/.copilot/skills
ln -sfn config/~/.agents/skills ~/.copilot/skills
```
