#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install 1password-cli

apt_remove 1password-cli
apt_remove_list 1password.list
apt_remove_keyring 1password-archive-keyring.gpg
remove_files /usr/local/bin/op
