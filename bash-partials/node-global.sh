#
#
#   Utils for global node packages
#
# ==========================================================

require-env-var DOT_ROOT

install-node-module() {
  module="$1"
  cd "$DOT_ROOT"
  which yarn
  (
    yarn add "$module"
  )
}

require-node-module() {
  module="$1"
  if [ ! -d "${DOT_ROOT}/node_modules/${module}" ]; then
    warn "$module not found, installing..."
    install-node-package "$module"
  fi
}
