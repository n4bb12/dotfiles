export SHELL_PROFILE=~/.zprofile
export GIT_HOME=~/git
export DOT_REPO=$GIT_HOME/n4bb12/dotfiles

eval "$(/opt/homebrew/bin/brew shellenv)"
cd $GIT_HOME
source $DOT_REPO/dist/bash.sh
