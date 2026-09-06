#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set shell bash

packages=(
  bundle-phobia-cli
  fx
  jq
  nodemon
  npm-check-updates
  open-cli
  prettier
  release-it
  serve
  slugify-cli
  sort-package-json
  tldr
  tsx
  vercel
)
npm i -g "${packages[@]}"
echo npm packages installed
