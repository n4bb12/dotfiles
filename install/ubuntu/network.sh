#!/usr/bin/env bash
set -euo pipefail

if ! grep -q 'generateResolvConf = false' /etc/wsl.conf; then
  echo -e '[network]\ngenerateResolvConf = false' | sudo tee -a /etc/wsl.conf
fi

if ! grep -q 'nameserver 1.1.1.3' /etc/resolv.conf; then
  sudo rm /etc/resolv.conf
  echo -e 'nameserver 1.1.1.3\nnameserver 1.0.0.3' | sudo tee /etc/resolv.conf
  sudo chattr +i /etc/resolv.conf
fi
