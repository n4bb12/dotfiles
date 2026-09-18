#!/usr/bin/env bash
set -euo pipefail

# Requires DIR to be the flavor directory (install/ubuntu or install/omarchy).
: "${DIR:?DIR must be the flavor install directory}"

COMMON="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$COMMON/_lib.sh"

REPO_ROOT="$(cd "$DIR/../.." && pwd)"

ln -s -f "$DIR/_index.sh" "$HOME/install.sh"
append_bashrc '# dotfiles' "source $REPO_ROOT/aliases/_index.sh"
