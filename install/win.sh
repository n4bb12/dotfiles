#!/usr/bin/env bash
DIR=$(cd $(dirname $0) && pwd)
set -ex

source "$DIR/git.sh"
source "$DIR/npm-win.sh"
source "$DIR/path-win.sh"
