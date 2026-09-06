#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install bun

remove_files "$HOME/.bun/bin/bun" "$HOME/.bun/bin/bunx"

append_bashrc '# bun' 'export PATH="$PATH:$HOME/.bun/bin"'
export PATH="$PATH:$HOME/.bun/bin"
