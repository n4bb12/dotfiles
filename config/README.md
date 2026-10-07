# Configuration Files

Each path under this directory is the destination path on disk.

- `config/~/.gitignore` → `~/.gitignore`
- `config/%USERPROFILE%/.wslconfig` → `%USERPROFILE%\.wslconfig`

`config/cursor/settings.json` and `config/cursor/keybindings.json` are symlinked into the Cursor user directory (`~/.config/Cursor/User` on Linux). The IDE and the Agents window both read that keybindings file. Agents commands use `glass.*` ids, so those bindings live in the same file.

Run `config` from a shell with aliases loaded, or `bun config` from this repo.
