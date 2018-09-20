#
#
#   Utils for global node packages
#
# ==========================================================

require-env-var DOT_ROOT

install-node-package() {
  module="$1"
  export PATH="$SYSTEM_PATH"
  cd "$DOT_ROOT"
  which yarn
  (
    yarn add "$module"
  )
  export PATH="$DOT_PATH"
}

node-global() {
  NODE_PATH="${DOT_ROOT}/node_modules" \
    node "$@"
}

require-node-package() {
  module="$1"
  if [ ! -d "${DOT_ROOT}/node_modules/${module}" ]; then
    warn "$module not found, installing..."
    install-node-package "$module"
  fi
}
