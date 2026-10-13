# Configuration Files

Each path under this directory is the destination path on disk.

- `config/~/.gitignore` → `~/.gitignore`
- `config/%USERPROFILE%/.wslconfig` → `%USERPROFILE%\.wslconfig`

`config/cursor/settings.json` and `config/cursor/keybindings.json` belong in the Cursor user directory (`~/.config/Cursor/User` on Linux, `%APPDATA%\Cursor\User` on Windows). The IDE and the Agents window both read that keybindings file. Agents commands use `glass.*` ids, so those bindings live in the same file.

Nothing copies these files automatically, because what fits differs per machine. `~/.ssh/config`, for example, differs between Kubuntu and WSL. Each system README in `install/` lists the files to copy or link.
