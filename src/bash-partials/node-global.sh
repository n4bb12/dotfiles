#
#
#   Utils for global node packages
#
# ==========================================================

require-env-var DOT_ROOT

function install-node-package() {
  module="$1"
  export PATH="$SYSTEM_PATH"
  cd "$DOT_ROOT"
  which yarn
  (
    yarn add "$module"
  )
  export PATH="$DOT_PATH"
}

function node-global() {
  NODE_PATH="${DOT_ROOT}/node_modules" \
    node "$@"
}

function require-node-package() {
  module="$1"
  if [ ! -d "${DOT_ROOT}/node_modules/${module}" ]; then
    warn "$module not found, installing..."
    install-node-package "$module"
  fi
}
