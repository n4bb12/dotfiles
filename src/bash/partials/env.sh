require-env-var() {
  if [ -z ${!1} ]; then
    fail "Environment variable '$1' not found"
    return 1
  fi
}

require-binary() {
  if ! command -v "$1" > /dev/null 2>&1; then
    fail "Command '$1' not found"
    return 1
  fi
}
