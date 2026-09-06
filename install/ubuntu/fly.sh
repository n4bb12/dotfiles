#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install flyctl
remove_files "$HOME/.fly/bin/flyctl" "$HOME/.fly/bin/fly"
