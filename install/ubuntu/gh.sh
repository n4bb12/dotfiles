#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install gh

apt_remove gh
apt_remove_list github-cli.list
apt_remove_keyring githubcli-archive-keyring.gpg

if ! gh auth status &>/dev/null; then
  gh auth login
fi
