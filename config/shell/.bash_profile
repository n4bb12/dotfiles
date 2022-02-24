#!/usr/bin/env bash

export TERM="cygwin"
export SHELL_PROFILE="~/.bash_profile"

function winget {
  cmd.exe /c "winget $1 $2 $3"
}

cd "$GIT_HOME"
source "$GIT_HOME"/n4bb12/dotfiles/dist/bash.sh
