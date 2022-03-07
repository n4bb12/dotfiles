eval "$(/opt/homebrew/bin/brew shellenv)"

export SHELL_PROFILE=~/.zprofile
export GIT_HOME=~/git
export DOT_REPO="$GIT_HOME/n4bb12/dotfiles"
export PATH="$PATH:$(brew --prefix gnu-sed)/libexec/gnubin"
export PATH="$PATH:$(brew --prefix coreutils)/libexec/gnubin"

function backup-prefs() {
  for file in $(find ~/Library/Preferences -name "com.apple.*" -print); do
    cp $file $DOT_REPO/config/Library/Preferences/
  done
}

cd $GIT_HOME
source $DOT_REPO/dist/bash.sh

if type brew &>/dev/null; then
  FPATH=$(brew --prefix)/share/zsh-completions:$FPATH

  autoload -Uz compinit
  compinit
fi
