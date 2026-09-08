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
  mysql-client
  postgresql-client
  procps
  python3
  python3-pip
  redis-tools
  unzip
  wget
  xdg-utils
  xz-utils
  zip
)
sudo apt install -y "${packages[@]}"
