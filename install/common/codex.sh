#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://github.com/openai/codex
curl -fsSL https://chatgpt.com/codex/install.sh | sh

append_bashrc '# local bin' 'export PATH=~/.local/bin:$PATH'
export PATH=~/.local/bin:$PATH
