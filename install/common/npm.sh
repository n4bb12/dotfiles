#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed" >&2
  exit 1
fi

npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set shell bash
