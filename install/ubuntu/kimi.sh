#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://github.com/MoonshotAI/kimi-code
curl -fsSL https://code.kimi.com/kimi-code/install.sh | bash

append_bashrc '# kimi-code' 'export PATH=~/.kimi-code/bin:$PATH'
export PATH=~/.kimi-code/bin:$PATH
