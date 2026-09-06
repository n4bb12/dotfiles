#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install gum

apt_remove gum
apt_remove_list charm.list
apt_remove_keyring charm.gpg
