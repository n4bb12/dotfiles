# Source from ~/.bashrc:
#   source ~/git/n4bb12/dotfiles/aliases/load.sh

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

source "$SCRIPT_DIR/core.sh"

if grep -qi microsoft /proc/version 2>/dev/null; then
  source "$SCRIPT_DIR/os_wsl.sh"
elif [[ "${OSTYPE:-}" == msys* || "${OSTYPE:-}" == cygwin* || -n "${MSYSTEM:-}" ]]; then
  source "$SCRIPT_DIR/os_windows.sh"
fi

source "$SCRIPT_DIR/js.sh"
source "$SCRIPT_DIR/git.sh"
source "$SCRIPT_DIR/editor.sh"
source "$SCRIPT_DIR/agents.sh"
source "$SCRIPT_DIR/accounts.sh"
source "$SCRIPT_DIR/powerline.sh"
