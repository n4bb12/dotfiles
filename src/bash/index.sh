#!/usr/bin/env bash

export DOTFILES_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export "PATH=$PATH:$DOTFILES_ROOT/node_modules/.bin"

import() {
  echo "import $1"
  source "$DOTFILES_ROOT/bash/partials/$1.sh"
}

# --> /
import cd
import colors
import explorer
import ls

# --> colors
import env

# --> env
import git
import node-global

# --> node-global
import bitly
import browser
import change-case
import clipboard
import free-port
import http-server
import kill
import npm-name-available
import open
import pnpm
import select
import tldr
import underscore
import words
import yarn

# --> browser
import urls
