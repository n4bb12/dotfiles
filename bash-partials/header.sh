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
export SHELL_PROFILE="~/.shell_profile"

function reload() {
  previous_pwd=$(pwd)
  source "$SHELL_PROFILE"
  cd "$previous_pwd"
}

function scaffold() {
  if [[ -f "$1" ]]; then
    source "$1"
  else
    echo '#!/usr/bin/env bash' > "$1"
    echo 'DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)' >> "$1"
    echo 'set -e' >> "$1"
  fi
}

scaffold "~/.env"
scaffold "~/.aliases"
scaffold "$SHELL_PROFILE"

alias .env="code ~/env.sh"
alias .aliases="code ~/aliases.sh"
alias .profile="code $SHELL_PROFILE"
