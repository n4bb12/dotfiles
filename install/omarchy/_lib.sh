_OMARCHY_INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../common/_lib.sh
source "$_OMARCHY_INSTALL_DIR/../common/_lib.sh"

case ":$PATH:" in
  *":$HOME/.local/share/mise/shims:"*) ;;
  *) PATH="${PATH:+$PATH:}$HOME/.local/share/mise/shims" ;;
esac
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) PATH="${PATH:+$PATH:}$HOME/.local/bin" ;;
esac
export PATH

pkg_add() {
  omarchy pkg add "$@"
}

pkg_aur_add() {
  omarchy pkg aur add "$@"
}
