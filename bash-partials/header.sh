#!/usr/bin/env bash

if [[ -z "$DOT_ROOT" ]]; then
  export DOT_ROOT=$(dirname "$0")
  export DOT_PATH="$DOT_ROOT/node_modules/.bin:$PATH"
  export SYSTEM_PATH="$PATH"
  export PATH="$DOT_PATH"
fi
