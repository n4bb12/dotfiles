set -o magicequalsubst

export SHELL_PROFILE=~/.zprofile
export GIT_HOME=~/git
export DOT_REPO=$GIT_HOME/n4bb12/dotfiles

function backup-prefs() {
  for file in $(find ~/Library/Preferences -name "com.apple.*" -print); do
    cp $file $DOT_REPO/config/Library/Preferences/
  done
}

eval "$(/opt/homebrew/bin/brew shellenv)"
cd $GIT_HOME
source $DOT_REPO/dist/bash.sh

