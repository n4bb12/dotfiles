#!/usr/bin/env bash

export DOTFILES_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export "PATH=$PATH:$DOTFILES_ROOT/node_modules/.bin"

init() {
  echo "init $1"
  "$DOTFILES_ROOT/bash/partials/$1.sh"
}

# --> /
init git
init npm
