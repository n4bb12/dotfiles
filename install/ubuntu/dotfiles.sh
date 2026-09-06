#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

if [ ! -d ~/git/n4bb12/dotfiles ]; then
  mkdir -p ~/git/n4bb12
  pushd ~/git/n4bb12
  git clone git@github.com:n4bb12/dotfiles.git
  popd
fi

ln -s -f ~/git/n4bb12/dotfiles/install/ubuntu/_index.sh ~/install.sh
append_bashrc '# dotfiles' 'source ~/git/n4bb12/dotfiles/aliases/load.sh'
