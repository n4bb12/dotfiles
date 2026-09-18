#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# shellcheck source=../common/dotfiles.sh
source "$DIR/../common/dotfiles.sh"
