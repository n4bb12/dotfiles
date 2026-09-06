#!/usr/bin/env bash
DIR=$(cd $(dirname $0) && pwd)
set -ex

xcode-select --install || true

source "$DIR/../git.sh"
source "$DIR/npm.sh"
source "$DIR/brew.sh"

# Show hidden files
defaults write com.apple.Finder AppleShowAllFiles true

# Copy home files from config/~
config_home="$DIR/../../config/~"
cp -a "$config_home/." ~/
