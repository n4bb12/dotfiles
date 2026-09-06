append_bashrc() {
  local comment="$1"
  local line="$2"

  if grep -qF "$line" ~/.bashrc; then
    return 0
  fi

  echo >>~/.bashrc
  echo "$comment" >>~/.bashrc
  echo "$line" >>~/.bashrc
}

source_brew() {
  local brew_bin=""

  if [[ -x /home/linuxbrew/.linuxbrew/bin/brew ]]; then
    brew_bin=/home/linuxbrew/.linuxbrew/bin/brew
  elif [[ -x "${HOME}/.linuxbrew/bin/brew" ]]; then
    brew_bin="${HOME}/.linuxbrew/bin/brew"
  elif command -v brew >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi

  eval "$("$brew_bin" shellenv bash)"
}

brew_install() {
  if ! source_brew; then
    echo "Homebrew is not installed" >&2
    return 1
  fi

  if brew list --formula "$1" >/dev/null 2>&1; then
    return 0
  fi

  brew install "$@"
}

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

remove_files() {
  local path

  for path in "$@"; do
    if [[ -e "$path" || -L "$path" ]]; then
      rm -f "$path" 2>/dev/null || sudo rm -f "$path"
    fi
  done
}

remove_dirs() {
  local path

  for path in "$@"; do
    if [[ -d "$path" ]]; then
      rm -rf "$path" 2>/dev/null || sudo rm -rf "$path"
    fi
  done
}

cargo_uninstall() {
  if [[ ! -x "$HOME/.cargo/bin/cargo" ]]; then
    return 0
  fi

  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
  cargo uninstall "$@" || true
}

npm_uninstall_global() {
  if ! command -v npm >/dev/null 2>&1; then
    return 0
  fi

  npm uninstall -g "$@" || true
}
