#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the dotfiles repo.
# Provisions Bun (the package manager/runtime used by CI and the project
# scripts) and installs pinned dependencies from the committed lockfile.
set -euo pipefail

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi

export PATH="$BUN_INSTALL/bin:$PATH"

# Expose bun/bunx on the system PATH so non-login shells and the agent's
# install/start hooks find them without sourcing a shell profile.
if command -v sudo >/dev/null 2>&1; then
  sudo ln -sf "$BUN_INSTALL/bin/bun" /usr/local/bin/bun 2>/dev/null || true
  sudo ln -sf "$BUN_INSTALL/bin/bunx" /usr/local/bin/bunx 2>/dev/null || true
fi

bun --version
bun install --frozen-lockfile
