#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# shellcheck disable=SC1091
source "$HOME/.cargo/env"
cargo install killport
