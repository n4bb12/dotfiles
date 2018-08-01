#  
# 
#   Utils for global node packages
# 
# ==========================================================

require-env-var DOTFILES_ROOT

install-node-package() {
  module="$1"
  (
    set -e
    cd "$DOTFILES_ROOT"
    yarn add "$module"
  )
}

node-global() {
  NODE_PATH="${DOTFILES_ROOT}/node_modules" \
    node "$@"
}

require-node-package() {
  module="$1"
  if [ ! -d "${DOTFILES_ROOT}/node_modules/${module}" ]; then
    warn "$module not found, installing..."
    install-node-package "$module"
  fi
}
