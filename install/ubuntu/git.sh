#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install git
brew_install git-lfs
git lfs install

sudo add-apt-repository --remove -y ppa:git-core/ppa 2>/dev/null || true
apt_remove git-lfs

bash "$DIR/../git.sh"
