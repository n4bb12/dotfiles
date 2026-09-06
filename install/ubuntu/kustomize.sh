#!/usr/bin/env bash
set -euo pipefail

curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo install -o root -g root -m 0755 kustomize /usr/local/bin/kustomize
rm kustomize
kustomize --version
