# ENV ==================================

export USER=$(whoami)

SCRIPT_DIR=${SCRIPT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)}

# COLORS ===============================

black="\e[30m"
red="\e[31m"
green="\e[32m"
yellow="\e[33m"
blue="\e[34m"
magenta="\e[35m"
cyan="\e[36m"
gray="\e[37m"
reset="\e[39m"

fail() {
  printf '%b\n' "${red}${*}${reset}"
  return 1
}

warn() {
  printf '%b\n' "${yellow}${*}${reset}"
}

# NAVIGATION ===========================

alias l='ls'
alias ll='ls -aFhl --group-directories-first'

alias ~='cd ~'
alias ..='cd ..'
alias ..1='cd ..'
alias ..2='cd ../..'
alias ..3='cd ../../..'
alias ..4='cd ../../../..'
alias ..5='cd ../../../../..'

mkcd() {
  mkdir -p "$@"
  cd "$_"
}

# UTILS ================================

alias open='open-cli'

config() {
  local here="${SCRIPT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)}"
  bun run "$here/../scripts/config.ts" "$@"
}

# Kill by TCP port or process name. `kill 4020`, `kill :4020`, `kill node`.
unalias kill 2>/dev/null
kill() {
  local arg
  local status=0

  for arg in "$@"; do
    case "$arg" in
      -f | --force | -9) ;;
      :*)
        killport "${arg#:}" || status=$?
        ;;
      *[!0-9]*)
        pkill -9 -- "$arg" || status=$?
        ;;
      *)
        killport "$arg" || status=$?
        ;;
    esac
  done

  return "$status"
}

random() {
  local length="${1:-32}"
  openssl rand -hex $length
}

size() {
  if du -b /dev/null >/dev/null 2>&1; then
    local arg=-sbh
  else
    local arg=-sh
  fi
  if [[ -n "$@" ]]; then
    du $arg -- "$@"
  else
    du $arg .[^.]* ./*
  fi
}

slug() {
  if (($# == 0)); then
    input=$(cat -)
    slugify "$input"
  else
    slugify "$1"
  fi
}

cleanup_command() {
  echo
  echo "$@"
  set -x
  "$@"
  set +x
}

cleanup() {
  before=$(df -h / | tail -1 | awk '{print $3}')

  cleanup_command npm cache clean -f
  cleanup_command pnpm store prune -f
  cleanup_command yarn cache clean -f
  cleanup_command docker system prune -a -f

  cleanup_command rm -rf ~/.local/share/pnpm/
  cleanup_command rm -rf ~/.npm/_npx/
  cleanup_command rm -rf ~/.yarn/berry/store/

  cleanup_command find ~ -type d -name ".cache" -exec rm -rf {} +

  cleanup_command sudo apt autoremove
  cleanup_command sudo apt clean

  after=$(df -h / | tail -1 | awk '{print $3}')
  echo
  echo "Cleanup complete. Space available before: $before, after: $after"
}

update() {
  local failed=()

  update_step() {
    local name="$1"
    shift
    echo
    printf '%b\n' "${cyan}==> ${name}${reset}"
    if "$@"; then
      return 0
    fi
    warn "Failed: $name"
    failed+=("$name")
  }

  if [[ -x /home/linuxbrew/.linuxbrew/bin/brew ]]; then
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"
  elif [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv bash)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv bash)"
  fi

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  if command -v apt >/dev/null 2>&1; then
    update_step "apt update" sudo apt update
    update_step "apt upgrade" sudo apt upgrade -y
  fi

  if [[ "$(uname -s)" == Darwin ]] && command -v softwareupdate >/dev/null 2>&1; then
    update_step "macOS" softwareupdate --install --all
  fi

  if command -v brew >/dev/null 2>&1; then
    update_step "brew update" brew update
    update_step "brew upgrade" brew upgrade
  fi

  if command -v rustup >/dev/null 2>&1; then
    update_step "rustup" rustup update
  fi

  if command -v nvm >/dev/null 2>&1; then
    update_step "node lts" nvm install --lts --latest-npm
    update_step "node default" nvm alias default "lts/*"
    update_step "node use" nvm use --lts
  fi

  if command -v bun >/dev/null 2>&1; then
    update_step "bun" bun upgrade
    update_step "bun globals" bun update --global
  fi

  if command -v composer >/dev/null 2>&1; then
    update_step "composer" sudo composer self-update
  fi

  if command -v wp >/dev/null 2>&1; then
    update_step "wp-cli" wp cli update --yes
  fi

  if command -v snap >/dev/null 2>&1; then
    update_step "snap" sudo snap refresh
  fi

  if command -v gh >/dev/null 2>&1; then
    update_step "gh extensions" gh extension upgrade --all
  fi

  if command -v claude >/dev/null 2>&1; then
    update_step "claude" claude update
  fi

  if command -v cursor-agent >/dev/null 2>&1; then
    update_step "cursor" cursor-agent update
  fi

  if command -v codex >/dev/null 2>&1; then
    update_step "codex" codex update
  fi

  if command -v grok >/dev/null 2>&1; then
    update_step "grok" grok update
  fi

  if command -v kimi >/dev/null 2>&1; then
    update_step "kimi" kimi upgrade
  fi

  if command -v sst >/dev/null 2>&1; then
    update_step "sst" sst upgrade
  fi

  if command -v heroku >/dev/null 2>&1; then
    update_step "heroku" heroku update
  fi

  unset -f update_step

  echo
  if ((${#failed[@]})); then
    warn "Finished with failures: ${failed[*]}"
    return 1
  fi

  printf '%b\n' "${green}Update complete.${reset}"
}
