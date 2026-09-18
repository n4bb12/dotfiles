#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# Extras analogous to ubuntu/apt.sh that Omarchy does not ship by default.
packages=(
  mariadb-clients
  python-pip
  wget
)
pkg_add "${packages[@]}"
