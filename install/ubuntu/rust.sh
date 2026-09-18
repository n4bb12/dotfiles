#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

sudo apt autoremove -y rustc cargo || true

# shellcheck source=../common/rust.sh
source "$DIR/../common/rust.sh"
