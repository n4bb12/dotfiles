#
#
#   Utils for global node packages
#
# ==========================================================

require-env-var DOT_REPO

install-node-module() {
  module="$1"
  (
    echo "$DOT_REPO/dist"
    cd "$DOT_REPO/dist"
    yarn add "$module"
  )
}

require-node-module() {
  module="$1"
  module_path="$DOT_REPO/dist/node_modules/$module"

  if [ ! -d "$module_path" ]; then
    warn "$module not found, installing..."
    install-node-module "$module"
  fi
}
