#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# The CLI is the bun package `sentry` in ../common/bun.sh.
# Drop the old Homebrew formula and any leftover binary.
if source_brew && brew list --formula sentry-cli >/dev/null 2>&1; then
  brew uninstall sentry-cli
fi

remove_files /usr/local/bin/sentry-cli
