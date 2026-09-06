#!/usr/bin/env bash
set -euo pipefail

sudo apt install -y zsh
sudo chsh -s "$(which zsh)" "$(whoami)"
curl -fsSL https://raw.githubusercontent.com/zimfw/install/master/install.zsh | zsh
curl -fsSL --create-dirs -o "${ZIM_HOME}/zimfw.zsh" https://github.com/zimfw/zimfw/releases/latest/download/zimfw.zsh
