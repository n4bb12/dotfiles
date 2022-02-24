#!/usr/bin/env bash

export TERM="cygwin"

function winget {
  cmd.exe /c "winget $1 $2 $3"
}

source "$GIT_HOME"/n4bb12/dotfiles/dist/bash.sh
cd "$GIT_HOME"
