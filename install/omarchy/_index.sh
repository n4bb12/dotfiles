#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON="$(cd "$DIR/../common" && pwd)"
source "$DIR/_lib.sh"

# Comment out a line to skip that tool. Uncomment to include it.
# Runtimes (bun, node, go, php, rust, deno, java) and agents (gh, claude, …)
# come from Omarchy mise / `omarchy install dev-env`.

source "$COMMON/hushlogin.sh"
source "$DIR/pkg.sh"
source "$DIR/git.sh"
source "$DIR/gh.sh"
source "$DIR/acli.sh"
source "$DIR/dotfiles.sh"
source "$DIR/node.sh"
source "$COMMON/bun.sh"
source "$COMMON/config.sh"
source "$COMMON/heroku.sh"
source "$DIR/gcloud.sh"
source "$COMMON/wp-cli.sh"
source "$DIR/killport.sh"
source "$COMMON/plow.sh"
source "$DIR/fly.sh"
source "$COMMON/sst.sh"
source "$COMMON/kimi.sh"
source "$DIR/op.sh"
