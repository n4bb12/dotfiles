#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://sst.dev/docs/reference/cli/
curl -fsSL https://sst.dev/install | bash

append_bashrc '# sst' 'export PATH=~/.sst/bin:$PATH'
export PATH=~/.sst/bin:$PATH
