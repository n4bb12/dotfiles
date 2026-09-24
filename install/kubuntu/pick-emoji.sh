#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

desktop_id="com.n4bb12.dotfiles.pick-emoji.desktop"
native_desktop_id="org.kde.plasma.emojier.desktop"
legacy_desktop_id="net.local.plasma-emojier-paste.desktop"
shortcut="Meta+."
desktop_name="Pick Emoji"
udev_rule_name="80-ydotool-uinput.rules"
qdbus_package="qdbus-qt6"
# Plasma 6 service shortcuts store only the active sequence; the default lives in X-KDE-Shortcuts.

if [[ "$(id -u)" -eq 0 ]]; then
  echo "pick-emoji: run as the desktop user; the script calls sudo when needed" >&2
  exit 1
fi

XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"

say() {
  printf 'pick-emoji: %s\n' "$*"
}

warn() {
  printf 'pick-emoji: %s\n' "$*" >&2
}

has_group() {
  local group="$1"
  local who="${2:-}"
  local groups=""

  if [[ -n "$who" ]]; then
    groups="$(id -Gn "$who")"
  else
    groups="$(id -Gn)"
  fi

  case " ${groups} " in
  *" ${group} "*) return 0 ;;
  esac
  return 1
}

qdbus_name() {
  if command -v qdbus6 >/dev/null 2>&1; then
    printf '%s\n' qdbus6
    return 0
  fi
  if command -v qdbus-qt6 >/dev/null 2>&1; then
    printf '%s\n' qdbus-qt6
    return 0
  fi
  if command -v qdbus >/dev/null 2>&1; then
    printf '%s\n' qdbus
    return 0
  fi
  return 1
}

ensure_packages() {
  local -a pkgs=()

  if ! command -v wl-copy >/dev/null 2>&1; then
    pkgs+=(wl-clipboard)
  fi
  if ! command -v ydotool >/dev/null 2>&1 || ! command -v ydotoold >/dev/null 2>&1; then
    pkgs+=(ydotool)
  fi
  if ! qdbus_name >/dev/null; then
    if ! apt-cache show "$qdbus_package" >/dev/null 2>&1; then
      sudo apt-get update
    fi
    if ! apt-cache show "$qdbus_package" >/dev/null 2>&1; then
      warn "no qdbus binary found, and package ${qdbus_package} is not available"
      return 1
    fi
    pkgs+=("$qdbus_package")
  fi

  if ((${#pkgs[@]} == 0)); then
    return 0
  fi

  say "installing ${pkgs[*]}"
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y "${pkgs[@]}"
  hash -r
}

uinput_node_ok() {
  local mode group

  [[ -e /dev/uinput ]] || return 1
  group="$(stat -c '%G' /dev/uinput)"
  mode="$(stat -c '%a' /dev/uinput)"
  [[ "$group" == "uinput" ]] || return 1
  (((8#$mode & 8#020) != 0))
}

ensure_uinput() {
  local rule_src="$DIR/$udev_rule_name"
  local rule_dest="/etc/udev/rules.d/$udev_rule_name"
  local reload=0

  if ! getent group uinput >/dev/null; then
    sudo groupadd -f uinput
  fi

  if ! has_group uinput "$USER"; then
    sudo usermod -aG uinput "$USER"
  fi

  if [[ ! -f "$rule_dest" ]] || ! cmp -s "$rule_src" "$rule_dest"; then
    sudo install -m 0644 "$rule_src" "$rule_dest"
    reload=1
  fi

  if ((reload == 1)) || { [[ -e /dev/uinput ]] && ! uinput_node_ok; }; then
    sudo udevadm control --reload-rules
    sudo udevadm trigger
  fi
}

ydotool_user_unit() {
  local unit
  for unit in ydotool.service ydotoold.service; do
    if systemctl --user cat "$unit" >/dev/null 2>&1; then
      printf '%s\n' "$unit"
      return 0
    fi
  done
  return 1
}

ensure_ydotoold() {
  local unit=""

  if ! unit="$(ydotool_user_unit)"; then
    warn "ydotool has no user service on this system; start ydotoold in the session"
    return 0
  fi

  systemctl --user enable "$unit"

  if [[ ! -w /dev/uinput ]]; then
    warn "this session cannot write /dev/uinput yet, so ydotoold was not started"
    return 0
  fi

  if ! systemctl --user is-active --quiet "$unit"; then
    systemctl --user start "$unit"
  fi

  if systemctl --user is-active --quiet "$unit"; then
    say "${unit} is running"
  else
    systemctl --user status "$unit" --no-pager >&2 || true
    warn "${unit} is not running"
    return 1
  fi
}

verify_ydotool() {
  local err=""

  if [[ ! -w /dev/uinput ]]; then
    return 0
  fi

  if err="$(timeout 5 ydotool key 0 2>&1)"; then
    say "ydotool can send input"
    return 0
  fi

  if [[ -n "$err" ]]; then
    printf '%s\n' "$err" >&2
  fi
  warn "ydotool could not send input"
  return 1
}

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

join_tabs() {
  local IFS=$'\t'
  printf '%s' "$*"
}

split_shortcuts() {
  local raw="$1"
  local sep="$2"
  local -a parts=()
  local part trimmed

  if [[ -z "$raw" ]]; then
    return 0
  fi

  if [[ "$sep" == "tab" ]]; then
    IFS=$'\t' read -r -a parts <<<"$raw"
  else
    IFS=',' read -r -a parts <<<"$raw"
  fi

  for part in "${parts[@]}"; do
    trimmed="${part#"${part%%[![:space:]]*}"}"
    trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
    [[ -n "$trimmed" ]] || continue
    printf '%s\n' "$trimmed"
  done
}

shortcut_contains() {
  local raw="$1"
  local needle="$2"
  local part

  while IFS= read -r part; do
    if [[ "$part" == "$needle" ]]; then
      return 0
    fi
  done < <(split_shortcuts "$raw" tab)
  return 1
}

read_launch() {
  local desktop="$1"
  kreadconfig6 \
    --file kglobalshortcutsrc \
    --group services \
    --group "$desktop" \
    --key _launch
}

write_launch() {
  local desktop="$1"
  local value="$2"

  kwriteconfig6 \
    --file kglobalshortcutsrc \
    --group services \
    --group "$desktop" \
    --key _launch \
    "$value"
}

shortcut_group_exists() {
  local desktop="$1"
  local file="$XDG_CONFIG_HOME/kglobalshortcutsrc"

  [[ -f "$file" ]] || return 1
  grep -qxF "[services][${desktop}]" "$file"
}

native_desktop_file() {
  local path
  for path in \
    "/usr/share/kglobalaccel/${native_desktop_id}" \
    "/usr/share/applications/${native_desktop_id}"; do
    if [[ -f "$path" ]]; then
      printf '%s\n' "$path"
      return 0
    fi
  done
  return 1
}

# Drop Meta+. from a shortcut list. An empty result becomes "none", which keeps the key.
launch_without_meta_dot() {
  local raw="$1"
  local sep="$2"
  local -a kept=()
  local part

  while IFS= read -r part; do
    if [[ "$part" == "$shortcut" ]]; then
      continue
    fi
    kept+=("$part")
  done < <(split_shortcuts "$raw" "$sep")

  if ((${#kept[@]} == 0)); then
    printf '%s' none
    return 0
  fi
  join_tabs "${kept[@]}"
}

# Disable Meta+. on one component without deleting its kglobalshortcutsrc key.
disable_meta_dot() {
  local desktop="$1"
  local current=""
  local source=""
  local sep="tab"
  local desired=""
  local desktop_file=""
  local part=""
  local found=0

  current="$(read_launch "$desktop")"
  if [[ "$current" == "none" ]]; then
    return 0
  fi

  if [[ -n "$current" ]]; then
    source="$current"
    sep="tab"
  elif [[ "$desktop" == "$native_desktop_id" ]]; then
    if ! desktop_file="$(native_desktop_file)"; then
      warn "Emoji Selector desktop file not found; Meta+. was left unchanged"
      return 0
    fi
    source="$(
      kreadconfig6 \
        --file "$desktop_file" \
        --group "Desktop Entry" \
        --key X-KDE-Shortcuts
    )"
    sep="comma"
  else
    return 0
  fi

  while IFS= read -r part; do
    if [[ "$part" == "$shortcut" ]]; then
      found=1
    fi
  done < <(split_shortcuts "$source" "$sep")
  if ((found == 0)); then
    return 0
  fi

  desired="$(launch_without_meta_dot "$source" "$sep")"
  if [[ "$desired" == "$current" ]]; then
    return 0
  fi

  write_launch "$desktop" "$desired"
  say "removed ${shortcut} from ${desktop} (${desired})"
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
      gsub(/\\t/, "\t", value)
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

check_klipper() {
  local qdbus=""
  local bus="/run/user/$(id -u)/bus"

  if ! qdbus="$(qdbus_name)"; then
    warn "qdbus6, qdbus-qt6, or qdbus not found"
    return 1
  fi

  if [[ -z "${DBUS_SESSION_BUS_ADDRESS:-}" && -S "$bus" ]]; then
    export DBUS_SESSION_BUS_ADDRESS="unix:path=${bus}"
  fi
  if [[ -z "${DBUS_SESSION_BUS_ADDRESS:-}" ]]; then
    warn "no session bus; Klipper can only be checked from a Plasma session"
    return 0
  fi

  if "$qdbus" org.kde.klipper /klipper org.kde.klipper.klipper.getClipboardContents >/dev/null 2>&1; then
    say "Klipper is reachable via ${qdbus}"
    return 0
  fi

  warn "Klipper is not reachable via ${qdbus}"
  return 1
}

ensure_packages

if ! command -v plasma-emojier >/dev/null 2>&1; then
  warn "plasma-emojier not found; the emoji picker needs KDE Plasma"
fi

ensure_uinput
runtime_status=0
ensure_ydotoold || runtime_status=1

chmod +x "$DIR/pick-emoji"
mkdir -p "$HOME/.local/bin"
ln -sfn "$DIR/pick-emoji" "$HOME/.local/bin/pick-emoji"

if ! command -v kwriteconfig6 >/dev/null 2>&1 || ! command -v kreadconfig6 >/dev/null 2>&1; then
  warn "kwriteconfig6 not found; the script is installed, the Plasma shortcut was skipped"
  verify_ydotool || runtime_status=1
  exit "$runtime_status"
fi

exec_arg="$(desktop_exec_arg "$HOME/.local/bin/pick-emoji")"
install_desktop "$XDG_DATA_HOME/applications/$desktop_id" "$exec_arg"
install_desktop "$XDG_DATA_HOME/kglobalaccel/$desktop_id" "$exec_arg"

disable_meta_dot "$native_desktop_id"
if shortcut_group_exists "$legacy_desktop_id"; then
  disable_meta_dot "$legacy_desktop_id"
fi

shortcut_file="$XDG_CONFIG_HOME/kglobalshortcutsrc"
conflicts="$(warn_shortcut_conflicts "$shortcut_file")"
if [[ -n "$conflicts" ]]; then
  warn "${shortcut} is also used elsewhere. Those bindings were left in place:"
  printf '%s\n' "$conflicts" >&2
fi

write_launch "$desktop_id" "$shortcut"

saved="$(read_launch "$desktop_id")"
if [[ "$saved" != "$shortcut" ]]; then
  warn "failed to save ${shortcut} for ${desktop_id}"
  exit 1
fi

native_saved="$(read_launch "$native_desktop_id")"
if shortcut_contains "$native_saved" "$shortcut"; then
  warn "Emoji Selector still has ${shortcut}"
  exit 1
fi
if [[ -z "$native_saved" ]]; then
  warn "Emoji Selector shortcut key is missing; Meta+. was not disabled in kglobalshortcutsrc"
  exit 1
fi

if command -v kbuildsycoca6 >/dev/null 2>&1; then
  kbuildsycoca6 >/dev/null
fi

status="$runtime_status"
verify_ydotool || status=1
check_klipper || status=1

say "insert an emoji into the focused window: ${shortcut}"
if [[ -e /dev/uinput ]]; then
  say "$(ls -l /dev/uinput)"
else
  warn "/dev/uinput is not present yet"
  status=1
fi

if ! has_group uinput; then
  say "log out and back in so the uinput group and the shortcut apply"
else
  say "the shortcut is active after the next Plasma login"
fi

exit "$status"
