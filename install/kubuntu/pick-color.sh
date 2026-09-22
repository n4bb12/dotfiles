#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

desktop_id="com.n4bb12.dotfiles.pick-color.desktop"
shortcut="Alt+Shift+C"
desktop_name="Pick Color"
# Plasma 6 service shortcuts store only the active sequence; the default lives in X-KDE-Shortcuts.

if ! command -v kwriteconfig6 >/dev/null 2>&1; then
  echo "pick-color: kwriteconfig6 not found; skipping Plasma color picker" >&2
  return 0 2>/dev/null || exit 0
fi

XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"

# plasmashell does not include ~/.local/bin, so the desktop entry needs an absolute Exec.
desktop_exec_arg() {
  local value="$1"
  local escaped

  if [[ "$value" =~ [^a-zA-Z0-9._@/+:-] ]]; then
    escaped="${value//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    printf '"%s"' "$escaped"
    return
  fi
  printf '%s' "$value"
}

install_desktop() {
  local dest="$1"
  local exec_arg="$2"

  mkdir -p "$(dirname "$dest")"
  printf '%s\n' \
    '[Desktop Entry]' \
    'Type=Application' \
    "Name=${desktop_name}" \
    "Exec=${exec_arg}" \
    'StartupNotify=false' \
    'Terminal=false' \
    'NoDisplay=true' \
    "X-KDE-Shortcuts=${shortcut}" \
    'X-KDE-GlobalAccel-CommandShortcut=true' \
    >"$dest"
  chmod +x "$dest"
}

warn_shortcut_conflicts() {
  local file="$1"

  [[ -f "$file" ]] || return 0

  awk -v shortcut="$shortcut" -v own="[services][${desktop_id}]" '
    function first_field(value, i, c, out, escaped) {
      out = ""
      escaped = 0
      for (i = 1; i <= length(value); i++) {
        c = substr(value, i, 1)
        if (escaped) {
          out = out c
          escaped = 0
          continue
        }
        if (c == "\\") {
          escaped = 1
          continue
        }
        if (c == ",") {
          return out
        }
        out = out c
      }
      return out
    }

    /^\[/ {
      group = $0
      next
    }

    /^[[:space:]]*(#|;|$)/ {
      next
    }

    {
      eq = index($0, "=")
      if (eq == 0) {
        next
      }
      key = substr($0, 1, eq - 1)
      value = substr($0, eq + 1)
      if (group == own && key == "_launch") {
        next
      }
      active = first_field(value)
      count = split(active, parts, "\t")
      for (i = 1; i <= count; i++) {
        if (parts[i] == shortcut) {
          print group " " key
        }
      }
    }
  ' "$file"
}

chmod +x "$DIR/pick-color"
mkdir -p "$HOME/.local/bin"
ln -sfn "$DIR/pick-color" "$HOME/.local/bin/pick-color"

exec_arg="$(desktop_exec_arg "$HOME/.local/bin/pick-color")"
install_desktop "$XDG_DATA_HOME/applications/$desktop_id" "$exec_arg"
install_desktop "$XDG_DATA_HOME/kglobalaccel/$desktop_id" "$exec_arg"

shortcut_file="$XDG_CONFIG_HOME/kglobalshortcutsrc"
conflicts="$(warn_shortcut_conflicts "$shortcut_file")"
if [[ -n "$conflicts" ]]; then
  printf 'pick-color: %s is already used. Existing bindings were left unchanged:\n' "$shortcut" >&2
  printf '%s\n' "$conflicts" >&2
fi

kwriteconfig6 \
  --file kglobalshortcutsrc \
  --group services \
  --group "$desktop_id" \
  --key _launch \
  "$shortcut"

if command -v kbuildsycoca6 >/dev/null 2>&1; then
  kbuildsycoca6 >/dev/null
fi

if ! command -v qdbus6 >/dev/null 2>&1 && ! command -v qdbus-qt6 >/dev/null 2>&1; then
  echo "pick-color: qdbus6 or qdbus-qt6 not found; the picker needs Qt 6 D-Bus tools" >&2
fi

printf '%s\n' "Pick screen color and copy #RRGGBB to clipboard: ${shortcut}"
printf '%s\n' "The shortcut is active after the next Plasma login."
