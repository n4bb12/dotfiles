#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export PATH=~/.bun/bin:$PATH
bun run "$DIR/../../scripts/config.ts"
