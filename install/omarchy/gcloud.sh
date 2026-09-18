#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

pkg_aur_add google-cloud-cli
gcloud config set disable_usage_reporting True
gcloud init
