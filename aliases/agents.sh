alias skills='bunx skills'
alias ai='codex e --skip-git-repo-check'

# URL-encode a string (percent-encoding for query values, etc.)
# Pure Bash, no external tools.
urlencode() {
  local s="$1" b result=""
  for ((i = 0; i < ${#s}; i++)); do
    b="${s:i:1}"
    case "$b" in
      [a-zA-Z0-9.~_-]) result+="$b" ;;
      *) printf -v hex '%%%02X' "'$b"; result+="$hex" ;;
    esac
  done
  printf '%s\n' "$result"
}

app() {
  # Open the Codex app.
  #   app       -> open the app with no specific path
  #   app .     -> open current directory (like code .)
  #   app path  -> open the given path
  local url

  if [ $# -eq 0 ]; then
    url="codex://"
  else
    local target="$1"

    # Expand ~
    if [[ "$target" == ~* ]]; then
      target="${target/#\~/$HOME}"
    fi

    # Make relative paths absolute (based on current shell dir)
    if [[ "$target" != /* ]]; then
      target="$PWD/$target"
    fi

    local p
    p="$(wslpath -w "$target")"
    url="codex://new?path=$(urlencode "$p")"
  fi

  # Run cmd.exe from a safe non-UNC directory (/mnt/c) so that
  # Windows CMD doesn't print the "UNC paths are not supported"
  # warning + current directory noise.
  (cd /mnt/c 2>/dev/null || cd /; cmd.exe /c start "" "$url") >/dev/null 2>&1
}

# AI

cask() {
  cursor-agent -p --output-format text \
    "Do not modify files. Answer this question: $*"
}

gask() {
  grok --sandbox read-only -p "$*"
}

oask() {
  codex exec --sandbox read-only "$*"
}

oask-silent() {
  local output status
  output="$(mktemp)" || return 1

  codex exec --sandbox read-only \
    --output-last-message "$output" \
    "$*" >/dev/null 2>&1
  status=$?

  if (( status == 0 )); then
    # Codex may omit the final newline, which lets the shell prompt overwrite
    # part of the response. Also normalize CRLF output when running in WSL.
    command awk '{ sub(/\r$/, ""); print }' "$output"
  fi

  command rm -f "$output"
  return "$status"
}

oask-app-server() {
  local script_dir
  script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
  bun run "$script_dir/oask-app-server.ts" "$@"
}

oask-ai-sdk() {
  local script_dir
  script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
  bun run "$script_dir/oask-ai-sdk.ts" "$@"
}

alias ask='oask-app-server'
alias ?=ask
