#!/usr/bin/env bash
DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)

export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"
export LC_COLLATE="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
export LC_MESSAGES="en_US.UTF-8"
export LC_MONETARY="en_US.UTF-8"
export LC_NUMERIC="en_US.UTF-8"
export LC_TIME="en_US.UTF-8"

export DOT_ROOT="$DIR"
export PATH="$DIR/node_modules/.bin:$PATH"
export USER_ENV="$HOME/.env"
export USER_ALIASES="$HOME/.aliases"

function scaffold() {
  if [[ -f "$1" ]]; then
    source "$1"
  else
    echo '#!/usr/bin/env bash' > "$1"
    echo 'DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)' >> "$1"
    echo 'set -e' >> "$1"
  fi
}

scaffold "$USER_ENV"
scaffold "$USER_ALIASES"

alias .env='code $USER_ENV'
alias .aliases='code $USER_ALIASES'
alias .profile='code $SHELL_PROFILE'
