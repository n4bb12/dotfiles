#!/usr/bin/env bash
set -euo pipefail

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
id="vibetyperlift"
data="${XDG_DATA_HOME:-$HOME/.local/share}"

if ! command -v kwriteconfig6 >/dev/null 2>&1 || ! command -v qdbus6 >/dev/null 2>&1; then
  echo "vibe-typer-lift: needs KDE Plasma 6 (kwriteconfig6, qdbus6)" >&2
  exit 1
fi

mkdir -p "$data/kwin/scripts"
target="$data/kwin/scripts/$id"
if [ -e "$target" ] && [ ! -L "$target" ]; then
  rm -rf "$target"
fi
ln -sfn "$dir/$id" "$target"

kwriteconfig6 --file kwinrc --group Plugins --key "${id}Enabled" true

if qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "$id" | grep -qx true; then
  qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$id" >/dev/null
fi
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript "$dir/$id/contents/code/main.js" "$id" >/dev/null
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.start

printf '%s\n' "Vibe Typer's waveform sits 200px higher. Change liftPx in $dir/$id/contents/code/main.js and run this again."
