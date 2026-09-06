#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

if ! source_brew; then
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  source_brew
fi

append_bashrc '# brew' 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"'
append_bashrc '# local bin' 'export PATH=~/.local/bin:$PATH'

brew update
brew upgrade

packages=(
  bat
  fd
  ffmpeg
  fzf
  hyperfine
  jq
  openjdk
  ripgrep
  shfmt
  xclip
)
for package in "${packages[@]}"; do
  brew_install "$package"
done

apt_remove bat fd-find ffmpeg fzf hyperfine jq openjdk-17-jdk openjdk-17-jdk-headless openjdk-17-jre openjdk-17-jre-headless ripgrep shfmt xclip
apt_autoremove
