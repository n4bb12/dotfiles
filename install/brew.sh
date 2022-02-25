#!/usr/bin/env bash
set -ex

brew tap homebrew/cask-fonts

function brew-install() {
  brew list "$1" || brew install "$1"
}

brew-install node

function brew-install-cask() {
  brew list "$1" || brew install --cask "$1"
}

brew-install-cask 1password
brew-install-cask docker
brew-install-cask font-fira-code
brew-install-cask franz
brew-install-cask google-chrome
brew-install-cask slack
brew-install-cask sourcetree
brew-install-cask timeular
brew-install-cask unlox
brew-install-cask visual-studio-code
