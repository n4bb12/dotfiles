#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://fly.io/docs/hands-on/install-flyctl/
curl -L https://fly.io/install.sh | sh

append_bashrc '# flyctl' 'export PATH="$HOME/.fly/bin:$PATH"'
export PATH="$HOME/.fly/bin:$PATH"
