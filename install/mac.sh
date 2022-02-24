#!/usr/bin/env bash
DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
set -ex

xcode-select --install || true

# source "$DIR/git.sh"
# source "$DIR/npm-mac.sh"
# source "$DIR/brew.sh"

# Show hidden files
defaults write com.apple.Finder AppleShowAllFiles true

# Set sign-in keyboard profile to 'German - Standard'
for home in /Users/*/; do
  sudo cp -R ${DIR}/../config/Library/* ${home}Library/
done
