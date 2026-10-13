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

npm_uninstall_global() {
  if ! command -v npm >/dev/null 2>&1; then
    return 0
  fi

  npm uninstall -g "$@" || true
}
