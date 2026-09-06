#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

# https://rustup.rs/
sudo apt autoremove -y rustc cargo || true
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

append_bashrc '# cargo' 'source "$HOME/.cargo/env"'
# shellcheck disable=SC1091
source "$HOME/.cargo/env"
