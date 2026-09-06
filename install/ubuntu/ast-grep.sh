#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source "$HOME/.cargo/env"

cargo install ast-grep
