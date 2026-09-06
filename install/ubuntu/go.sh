#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install go

apt_remove golang-go golang-doc golang-src gccgo-go
apt_autoremove

append_bashrc '# go' 'export PATH=~/go/bin:$PATH'
export PATH=~/go/bin:$PATH
