#!/usr/bin/env bash

function winget {
  cmd.exe /c "winget $1 $2 $3"
}

export SHELL_PROFILE="~/.bash_profile"
export GIT_HOME="/d/Projects"
export DOT_REPO="$GIT_HOME/n4bb12/dotfiles"

cd "$GIT_HOME"
source "$DOT_REPO"/dist/bash.sh
