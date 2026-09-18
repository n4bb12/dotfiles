#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is not installed" >&2
  exit 1
fi

packages=(
  @biomejs/biome
  @playwright/cli
  @shopify/cli
  agent-browser
  convex
  fx
  nodemon
  npm-check-updates
  open-cli
  opencode-ai
  pnpm
  prettier
  release-it
  serve
  skills
  slugify-cli
  sort-package-json
  supabase
  vercel
  workos
  yarn
)
bun add --global "${packages[@]}"

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

npm_uninstall_global \
  @biomejs/biome \
  @playwright/cli \
  @shopify/cli \
  agent-browser \
  bundle-phobia-cli \
  convex \
  fx \
  jq \
  nodemon \
  npm-check-updates \
  open-cli \
  opencode-ai \
  pnpm \
  prettier \
  release-it \
  serve \
  skills \
  slugify-cli \
  sort-package-json \
  supabase \
  tldr \
  tsx \
  vercel \
  workos \
  yarn
