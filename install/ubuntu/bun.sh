#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install bun

remove_files "$HOME/.bun/bin/bun" "$HOME/.bun/bin/bunx" /usr/local/bin/biome

append_bashrc '# bun' 'export PATH="$PATH:$HOME/.bun/bin"'
export PATH="$PATH:$HOME/.bun/bin"

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
