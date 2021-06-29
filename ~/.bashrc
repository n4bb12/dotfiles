#!/usr/bin/env bash

source "~/env.sh"

export LANG="en_US.UTF-8"
export LC_COLLATE="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
export LC_MESSAGES="en_US.UTF-8"
export LC_MONETARY="en_US.UTF-8"
export LC_NUMERIC="en_US.UTF-8"
export LC_TIME="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

export TERM=cygwin

function winget {
  cmd.exe /c "winget $1 $2 $3"
}

function rc() {
  code ~/.bashrc
}

function edit() {
  code ~/aliases.sh
}

function reload() {
  previous_pwd=$(pwd)
  source ~/.bashrc
  cd "$previous_pwd"
}

source "$GIT_HOME/n4bb12/dotfiles/dist/bash.sh"
cd "$GIT_HOME"
