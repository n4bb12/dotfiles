#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

brew_install awscli

remove_files /usr/local/bin/aws /usr/local/bin/aws_completer
remove_dirs /usr/local/aws-cli
