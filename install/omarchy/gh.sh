#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

command -v gh >/dev/null 2>&1 || pkg_add github-cli

if ! gh auth status &>/dev/null; then
  gh auth login
fi
