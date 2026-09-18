#!/usr/bin/env bash
set -euo pipefail

if ! gh auth status &>/dev/null; then
  gh auth login
fi
