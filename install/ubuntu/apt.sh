#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt upgrade -y

sudo apt install -y bash-completion
source /etc/profile.d/bash_completion.sh

packages=(
  bat
  build-essential
  ca-certificates
  curl
  fd-find
  fzf
  hyperfine
  python3
  unzip
  wget
)
sudo apt install -y "${packages[@]}"
