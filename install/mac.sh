#!/usr/bin/env bash
DIR=$(cd $(dirname $0) && pwd)
set -ex

xcode-select --install || true

source "$DIR/git.sh"
source "$DIR/npm-mac.sh"
source "$DIR/brew.sh"

# Show hidden files
defaults write com.apple.Finder AppleShowAllFiles true

# Copy home files
cp ${DIR}/../config/home ~/
cp ${DIR}/../config/shell/.zprofile ~/

# Restore preferences
for home in /Users/*/; do
  sudo cp -R ${DIR}/../config/Library/Preferences/* ${home}Library/Preferences/
done
