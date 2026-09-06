#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

sudo apt install -y golang-go

append_bashrc '# go' 'export PATH=~/go/bin:$PATH'
export PATH=~/go/bin:$PATH
