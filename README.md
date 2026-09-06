<h1 align="center">
  <img alt="Logo" src="icon.png" width="48" height="48">
  dotfiles
</h1>

<p align="center">
  Config files, scripts, productivity stuff
</p>

<p align="center">
  <a href="https://github.com/n4bb12/dotfiles/blob/main/LICENSE">
    <img alt="License" src="https://flat.badgen.net/github/license/n4bb12/dotfiles?icon=github">
  </a>
</p>

## Load

```bash
# Clone
git clone git@github.com:n4bb12/dotfiles.git ~/git/n4bb12/dotfiles

# From ~/.bashrc, or the current terminal:
source ~/git/n4bb12/dotfiles/aliases/load.sh
```

## Config

Files under `config/` are named by destination. Run `bun run config` to copy them into place.

- `config/~` is the user home on linux.
- `config/%USERPROFILE%` is the user home on Windows.

Machine bootstrap lives in `install/`.
