#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

omarchy install dev-env bun

# shellcheck source=../common/bun.sh
source "$DIR/../common/bun.sh"
