#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install ast-grep

cargo_uninstall ast-grep
remove_files "$HOME/.cargo/bin/ast-grep" "$HOME/.cargo/bin/sg"
