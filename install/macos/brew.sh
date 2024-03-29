#!/usr/bin/env bash
set -ex

brew update
brew upgrade

brew tap homebrew/cask-fonts

function brew-install() {
  brew list "$1" || brew install "$1"
}

brew-install bash
brew-install bash-completion@2
brew-install coreutils
brew-install docker-compose
brew-install findutils
brew-install gh
brew-install git
brew-install git-lfs
brew-install gmp
brew-install gnu-sed
brew-install gnupg
brew-install grep
brew-install moreutils
brew-install node
brew-install nvm
brew-install openjdk
brew-install openssh
brew-install screen
brew-install wget
brew-install zsh-completions

function brew-install-cask() {
  brew list "$1" || brew install --cask "$1"
}

brew-install-cask 1password
brew-install-cask beyond-compare
brew-install-cask docker
brew-install-cask font-fira-code
brew-install-cask franz
brew-install-cask google-chrome
brew-install-cask google-cloud-sdk
brew-install-cask intellij-idea-ce
brew-install-cask iterm2
brew-install-cask meetingbar
brew-install-cask slack
brew-install-cask sourcetree
brew-install-cask timeular
brew-install-cask unlox
brew-install-cask visual-studio-code

brew cleanup

compaudit | xargs chmod g-w
