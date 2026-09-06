#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install kustomize
remove_files /usr/local/bin/kustomize
kustomize version
