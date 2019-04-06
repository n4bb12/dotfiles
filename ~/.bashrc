#!/usr/bin/env bash

export LANG="de_DE.UTF-8"
export LC_COLLATE="de_DE.UTF-8"
export LC_CTYPE="de_DE.UTF-8"
export LC_MESSAGES="de_DE.UTF-8"
export LC_MONETARY="de_DE.UTF-8"
export LC_NUMERIC="de_DE.UTF-8"
export LC_TIME="de_DE.UTF-8"
export LC_ALL="de_DE.UTF-8"

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

alias rl="reload"

source ~/aliases.sh
source ~/GIT/n4bb12/dotfiles/dist/bash.sh

cd /D/Projects
