#!/usr/bin/env bash
set -euo pipefail

# https://github.com/jkfran/killport
# shellcheck disable=SC1091
source "$HOME/.cargo/env"

cargo install killport
