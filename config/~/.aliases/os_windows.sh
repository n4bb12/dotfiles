#!/usr/bin/env bash

export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"
export LC_COLLATE="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
export LC_MESSAGES="en_US.UTF-8"
export LC_MONETARY="en_US.UTF-8"
export LC_NUMERIC="en_US.UTF-8"
export LC_TIME="en_US.UTF-8"

export TERM=cygwin
export PGCLIENTENCODING="utf-8"

PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\" "`cygpath -w "$PWD"`"'

function winget {
  cmd.exe /c "winget $1 $2 $3"
}

alias reload="source ~/.bash_profile"

alias mongod="mongod --dbpath $MONGO_HOME/db"

# Turn off POSIX-to-Windows path mangling. It breaks docker mount paths.
# https://github.com/git-for-windows/build-extra/blob/master/ReleaseNotes.md#new-features-61
alias docker='MSYS_NO_PATHCONV=1 docker'
