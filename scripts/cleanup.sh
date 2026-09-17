#!/usr/bin/env bash
set -Eeuo pipefail

ROOTS=(
  "$HOME/git"
)

echo "WSL cleanup"
df -h /

echo
echo "This removes:"
echo "  - node_modules"
echo "  - ignored build artifacts"
echo "  - package-manager caches"
echo "  - editor/download caches"
echo "  - Docker images, containers, volumes, and build cache"
echo "  - old user-owned /tmp files"
echo
read -r -p "Continue? [y/N] " answer

[[ "$answer" =~ ^[Yy]$ ]] || exit 0

remove() {
  local path="$1"

  [[ -e "$path" ]] || return 0

  echo "rm: $path"

  if rm -rf -- "$path" 2>/dev/null; then
    return 0
  fi

  echo "rm (sudo): $path"

  if sudo rm -rf -- "$path"; then
    return 0
  fi

  echo "skip (could not remove): $path"
}

echo
echo "== Project artifacts =="

for root in "${ROOTS[@]}"; do
  [[ -d "$root" ]] || continue

  while IFS= read -r -d '' dir; do
    repo="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null || true)"

    if [[ -z "$repo" ]]; then
      echo "skip (not in git repo): $dir"
      continue
    fi

    rel="$(realpath --relative-to="$repo" "$dir")"

    if git -C "$repo" check-ignore -q -- "$rel"; then
      remove "$dir"
    else
      echo "skip (not gitignored): $dir"
    fi
  done < <(
    find "$root" -type d \
      \( \
        -name node_modules -o \
        -name .next -o \
        -name .turbo -o \
        -name .output -o \
        -name .svelte-kit -o \
        -name .nuxt -o \
        -name .vinxi -o \
        -name .nitro -o \
        -name .vite -o \
        -name .parcel-cache -o \
        -name .nx -o \
        -name .cache -o \
        -name coverage -o \
        -name .nyc_output -o \
        -name dist -o \
        -name build -o \
        -name target -o \
        -path '*/.vercel/output' \
      \) \
      -prune -print0 2>/dev/null
  )

  # Common generated files
  find "$root" -type f \
    \( \
      -name '*.tsbuildinfo' -o \
      -name '.eslintcache' \
    \) \
    -delete 2>/dev/null || true
done

echo
echo "== Bun =="

remove "$HOME/.bun/install/cache"

echo
echo "== npm =="

if command -v npm >/dev/null; then
  npm cache clean --force || true
fi

remove "$HOME/.npm/_npx"

echo
echo "== pnpm =="

if command -v pnpm >/dev/null; then
  pnpm store prune || true
fi

echo
echo "== Yarn =="

if command -v yarn >/dev/null; then
  yarn cache clean || true
fi

echo
echo "== Python =="

if command -v pip >/dev/null; then
  pip cache purge || true
fi

if command -v uv >/dev/null; then
  uv cache clean || true
fi

echo
echo "== Go =="

if command -v go >/dev/null; then
  go clean -cache -modcache -testcache || true
fi

echo
echo "== Cargo =="

remove "$HOME/.cargo/registry/cache"
remove "$HOME/.cargo/registry/src"
remove "$HOME/.cargo/git/db"
remove "$HOME/.cargo/git/checkouts"

echo
echo "== General user cache =="

if [[ -d "$HOME/.cache" ]]; then
  find "$HOME/.cache" -mindepth 1 -maxdepth 1 \
    -exec rm -rf -- {} +
fi

echo
echo "== VS Code / Cursor =="

remove "$HOME/.vscode-server/data/CachedExtensionVSIXs"
remove "$HOME/.vscode-server/data/agent-host/sdk-cache"
remove "$HOME/.cursor-server/data/CachedExtensionVSIXs"

echo
echo "== Codex temp =="

remove "$HOME/.codex/.tmp"

echo
echo "== Old /tmp files =="

find /tmp \
  -mindepth 1 \
  -maxdepth 1 \
  -user "$USER" \
  -mtime +1 \
  -exec rm -rf -- {} + \
  2>/dev/null || true

echo
echo "== Docker =="

if command -v docker >/dev/null; then
  docker system prune -af || true
  docker builder prune -af || true
fi

echo
echo "== apt =="

if command -v apt-get >/dev/null; then
  sudo apt-get autoremove --purge -y
  sudo apt-get clean
fi

echo
echo "== Homebrew =="

if command -v brew >/dev/null; then
  brew autoremove || true
  brew cleanup --prune=all -s || true
fi

echo
echo "== Journal =="

if command -v journalctl >/dev/null; then
  sudo journalctl --vacuum-time=7d || true
fi

echo
echo "== Trim =="

sudo fstrim -av
sync

echo
echo "== Done =="

df -h
