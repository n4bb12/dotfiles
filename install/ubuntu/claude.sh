#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://code.claude.com/docs/en/install
curl -fsSL https://claude.ai/install.sh | bash

append_bashrc '# local bin' 'export PATH=~/.local/bin:$PATH'
export PATH=~/.local/bin:$PATH
