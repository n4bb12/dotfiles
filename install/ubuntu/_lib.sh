_UBUNTU_INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../common/_lib.sh
source "$_UBUNTU_INSTALL_DIR/../common/_lib.sh"

apt_is_installed() {
  dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q 'install ok installed'
}

apt_remove() {
  local pkg

  for pkg in "$@"; do
    if apt_is_installed "$pkg"; then
      sudo apt-get remove -y "$pkg" || true
    fi
  done
}

apt_remove_list() {
  sudo rm -f "/etc/apt/sources.list.d/$1" "/etc/apt/sources.list.d/$1.save"
}

apt_remove_keyring() {
  local name="$1"
  sudo rm -f "/etc/apt/keyrings/$name" "/usr/share/keyrings/$name"
}

apt_autoremove() {
  sudo apt-get autoremove -y || true
}
