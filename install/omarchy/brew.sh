#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"
source "$DIR/../common/brew-packages.sh"

native=()
for package in "${brew_packages[@]}"; do
  case "$package" in
    openjdk)
      omarchy install dev-env java
      ;;
    *)
      native+=("$package")
      ;;
  esac
done

pkg_add "${native[@]}"
