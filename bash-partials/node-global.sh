#
#
#   Utils for global node packages
#
# ==========================================================

require-env-var DOT_REPO

install-node-module() {
  module="$1"
  (
    cd "$DOT_REPO/dist"
    yarn add "$module"
  )
}

require-node-module() {
  module="$1"

  if [ ! -d "$DOT_REPO/dist/node_modules/$module" ]; then
    warn "$module not found, installing..."
    install-node-module "$module"
  fi
}
