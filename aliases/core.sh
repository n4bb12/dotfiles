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
