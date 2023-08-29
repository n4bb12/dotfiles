#!/usr/bin/env bash

export SHELL_PROFILE="~/.bash_profile"
export GIT_HOME="/d/Projects"
export DOT_REPO="$GIT_HOME/n4bb12/dotfiles"

# https://learn.microsoft.com/en-us/windows/terminal/tutorials/new-tab-same-directory#mingw
PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\" "`cygpath -w "$PWD"`"'

function winget {
  cmd.exe /c "winget $1 $2 $3"
}

alias idea="idea64"

source "$DOT_REPO"/dist/bash.sh
