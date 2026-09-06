#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt upgrade -y

sudo apt install -y bash-completion
source /etc/profile.d/bash_completion.sh

packages=(
  build-essential
  ca-certificates
  curl
  file
  git
  procps
  python3
  unzip
  wget
)
sudo apt install -y "${packages[@]}"
