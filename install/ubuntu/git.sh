#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sudo add-apt-repository -y ppa:git-core/ppa
sudo apt-get update
sudo apt-get install git -y

bash "$DIR/../git.sh"
