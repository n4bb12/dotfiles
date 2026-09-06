#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://x.ai/cli/install
curl -fsSL https://x.ai/cli/install.sh | bash

append_bashrc '# grok' 'export PATH=~/.grok/bin:$PATH'
export PATH=~/.grok/bin:$PATH
