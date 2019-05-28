#!/usr/bin/env bash

if [[ ! -v DOT_ROOT ]]; then
  export DOT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  export DOT_PATH="$DOT_ROOT/node_modules/.bin:$PATH"
  export SYSTEM_PATH="$PATH"
fi
