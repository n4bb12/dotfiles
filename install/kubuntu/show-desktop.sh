#!/usr/bin/env bash
set -euo pipefail

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
id="windows-show-desktop"
# Qt::Key_D | Qt::MetaModifier
meta_d=268435524
data="${XDG_DATA_HOME:-$HOME/.local/share}"

if ! command -v kwriteconfig6 >/dev/null 2>&1 || ! command -v qdbus6 >/dev/null 2>&1 || ! command -v busctl >/dev/null 2>&1; then
  echo "show-desktop: needs KDE Plasma 6 (kwriteconfig6, qdbus6, busctl)" >&2
  exit 1
fi

mkdir -p "$data/kwin/scripts"
ln -sfn "$dir/$id" "$data/kwin/scripts/$id"

kwriteconfig6 --file kwinrc --group Plugins --key "${id}Enabled" true
kwriteconfig6 --file kglobalshortcutsrc --group kwin --key "Show Desktop" "none,Meta+D,Peek at Desktop"

# Peek at Desktop is the only built-in Super+D action, and it is not minimize.
busctl --user call org.kde.kglobalaccel /kglobalaccel org.kde.KGlobalAccel setShortcutKeys \
  'asa(ai)u' 4 kwin "Show Desktop" KWin "Peek at Desktop" \
  0 4 >/dev/null

if qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "$id" | grep -qx true; then
  qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$id" >/dev/null
fi
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript "$dir/$id/contents/code/main.js" "$id" >/dev/null
qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.start

busctl --user call org.kde.kglobalaccel /kglobalaccel org.kde.KGlobalAccel setShortcutKeys \
  'asa(ai)u' 4 kwin WindowsShowDesktop KWin "Show Desktop (minimize)" \
  1 4 "$meta_d" 0 0 0 4 >/dev/null

kwriteconfig6 --file kglobalshortcutsrc --group kwin --key WindowsShowDesktop \
  "Meta+D,Meta+D,Show Desktop (minimize)"

bound="$(busctl --user call org.kde.kglobalaccel /kglobalaccel org.kde.KGlobalAccel shortcutKeys \
  as 4 kwin WindowsShowDesktop KWin "Show Desktop (minimize)")"
case "$bound" in
*"$meta_d"*) ;;
*)
  busctl --user call org.kde.kglobalaccel /kglobalaccel org.kde.KGlobalAccel setShortcutKeys \
    'asa(ai)u' 4 kwin "Show Desktop" KWin "Peek at Desktop" \
    1 4 "$meta_d" 0 0 0 4 >/dev/null
  kwriteconfig6 --file kglobalshortcutsrc --group kwin --key "Show Desktop" "Meta+D,Meta+D,Peek at Desktop"
  echo "show-desktop: Meta+D stayed on Peek at Desktop" >&2
  exit 1
  ;;
esac

printf '%s\n' "Super+D minimizes windows and leaves them minimized."
