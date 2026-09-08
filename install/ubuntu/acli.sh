#!/usr/bin/env bash
set -euo pipefail

sudo apt-get install -y wget gnupg2
sudo install -d -m 0755 /etc/apt/keyrings

wget -qO- https://acli.atlassian.com/gpg/public-key.asc |
  sudo gpg --dearmor --yes -o /etc/apt/keyrings/acli-archive-keyring.gpg
sudo chmod go+r /etc/apt/keyrings/acli-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/acli-archive-keyring.gpg] https://acli.atlassian.com/linux/deb stable main" |
  sudo tee /etc/apt/sources.list.d/acli.list >/dev/null

sudo apt-get update
sudo apt-get install -y acli
