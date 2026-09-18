#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://cursor.com/docs/cli/installation
curl -fsSL https://cursor.com/install | bash

append_bashrc '# local bin' 'export PATH=~/.local/bin:$PATH'
export PATH=~/.local/bin:$PATH
