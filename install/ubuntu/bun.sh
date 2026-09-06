#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://bun.sh/
curl -fsSL https://bun.sh/install | bash

append_bashrc '# bun' 'export PATH=~/.bun/bin:$PATH'
export PATH=~/.bun/bin:$PATH
