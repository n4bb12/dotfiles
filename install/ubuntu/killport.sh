#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install killport

cargo_uninstall killport
remove_files "$HOME/.cargo/bin/killport" "$HOME/.local/bin/killport"
