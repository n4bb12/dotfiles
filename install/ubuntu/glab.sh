#!/usr/bin/env bash
set -euo pipefail

glab_version=1.109.0
glab_package=$(mktemp --suffix=.deb)
curl -fsSL -o "$glab_package" "https://gitlab.com/gitlab-org/cli/-/releases/v${glab_version}/downloads/glab_${glab_version}_linux_amd64.deb"
sudo apt install "$glab_package" -y
rm -f "$glab_package"
