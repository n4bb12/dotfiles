#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install bun

remove_files "$HOME/.bun/bin/bun" "$HOME/.bun/bin/bunx" /usr/local/bin/biome

append_bashrc '# bun' 'export PATH="$PATH:$HOME/.bun/bin"'
export PATH="$PATH:$HOME/.bun/bin"

# shellcheck source=../common/bun.sh
source "$DIR/../common/bun.sh"
