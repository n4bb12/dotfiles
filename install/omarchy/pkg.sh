#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# Not shipped in Omarchy base. Comment out a package to skip it.
packages=(
  ast-grep
  aws-cli
  cloudflared
  glab
  hyperfine
  kubectl
  kustomize
  mariadb-clients
  python-pip
  sentry-cli
  shfmt
  wget
)
pkg_add "${packages[@]}"
