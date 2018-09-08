#!/usr/bin/env bash

export INIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

init() {
  echo "init $1"
  "$INIT_ROOT/$1.sh"
}

# --> /
init git
init npm
