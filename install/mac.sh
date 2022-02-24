#!/usr/bin/env bash
DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
set -ex

xcode-select --install || true

source "$DIR/git.sh"
source "$DIR/npm-mac.sh"
source "$DIR/brew.sh"
