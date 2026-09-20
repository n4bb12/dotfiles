# Omarchy – zusätzliche Einrichtung und Fixes

## 1. Bash: eigenes Dotfiles-Setup laden

In `~/.bashrc`:

```bash
# Omarchy environment (OMARCHY_PATH + PATH)
[[ -r /usr/share/omarchy/default/bash/env-bootstrap ]] && source /usr/share/omarchy/default/bash/env-bootstrap

# Interactive shell only from here
[[ $- != *i* ]] && return

# Omarchy defaults
source "$OMARCHY_PATH/default/bash/rc"

# Eigene Dotfiles
source ~/code/n4bb12/dotfiles/aliases/_index.sh
```

Neu laden:

```bash
source ~/.bashrc
```

---

## 2. Bash `hash`-Fehler mit Omarchy / mise beheben

Omarchy deaktiviert Bash Command Hashing absichtlich:

```bash
set +h
```

Deshalb dürfen eigene Shell-Funktionen nicht so prüfen, ob `git` existiert:

```bash
hash git 2>/dev/null || return
```

Stattdessen:

```bash
command -v git >/dev/null 2>&1 || return
```

Beispiel:

```bash
__git_info() {
  [[ $POWERLINE_GIT = 0 ]] && return
  command -v git >/dev/null 2>&1 || return

  local git_eng="env LANG=C git"

  local ref=$($git_eng symbolic-ref --short HEAD 2>/dev/null)

  if [[ -n "$ref" ]]; then
    ref=$SYMBOL_GIT_BRANCH$ref
  else
    ref=$($git_eng describe --tags --always 2>/dev/null)
  fi

  [[ -n "$ref" ]] || return

  local marks

  while IFS= read -r line; do
    if [[ $line =~ ^## ]]; then
      [[ $line =~ ahead\ ([0-9]+) ]] && marks+=" $SYMBOL_GIT_PUSH${BASH_REMATCH[1]}"
      [[ $line =~ behind\ ([0-9]+) ]] && marks+=" $SYMBOL_GIT_PULL${BASH_REMATCH[1]}"
    else
      marks="$SYMBOL_GIT_MODIFIED$marks"
      break
    fi
  done < <($git_eng status --porcelain --branch 2>/dev/null)

  printf " $ref$marks"
}
```

---

## 3. NVM entfernen, weil Omarchy bereits mise verwendet

NVM-Verzeichnis entfernen:

```bash
rm -rf ~/.config/nvm
```

Diese Zeilen aus `~/.bashrc` entfernen:

```bash
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Prüfen:

```bash
command -v nvm
```

Falls NVM zusätzlich als Arch-Paket installiert war:

```bash
pacman -Q | grep -i nvm
```

Falls vorhanden:

```bash
sudo pacman -Rns nvm
```

---

## 4. Node über mise verwalten

Globale LTS-Version:

```bash
mise use -g node@lts
```

Prüfen:

```bash
node --version
mise current
```

Für Projekte mit `.nvmrc`:

```bash
mise settings add idiomatic_version_file_enable_tools node
```

Projektbezogene Node-Version:

```bash
cd ~/code/mein-projekt
mise use node@22
```

Dadurch kann z. B. eine `mise.toml` entstehen:

```toml
[tools]
node = "22"
```

---

## 5. Homebrew entfernen

Offiziellen Homebrew-Uninstaller ausführen:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
```

Danach prüfen:

```bash
command -v brew
```

Brew-Einträge in Shell-Konfiguration suchen:

```bash
grep -RniE 'brew shellenv|linuxbrew|homebrew' \
  ~/.bashrc ~/.bash_profile ~/.profile ~/.config 2>/dev/null
```

Typische Zeile entfernen:

```bash
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

Falls noch ein ausschließlich von Brew verwendetes Verzeichnis übrig ist:

```bash
ls -la /home/linuxbrew
```

Dann gegebenenfalls:

```bash
sudo rm -rf /home/linuxbrew
```

Prüfen, ob Brew noch im `PATH` steckt:

```bash
echo "$PATH" | tr ':' '\n' | grep -i brew
```

---

## 6. Mausbeschleunigung deaktivieren

In:

```text
~/.config/hypr/input.lua
```

setzen:

```lua
hl.config({
  input = {
    accel_profile = "flat",
    sensitivity = 0,
  },
})
```

Hyprland neu laden:

```bash
hyprctl reload
```

`sensitivity = 0` ist neutral.

---

## 7. Rosé Pine Hyprcursor installieren und aktivieren

Installieren:

```bash
yay -S rose-pine-hyprcursor
```

Direkt testen:

```bash
hyprctl setcursor rose-pine-hyprcursor 32
```

Permanent in:

```text
~/.config/hypr/hyprland.lua
```

eintragen:

```lua
hl.env("HYPRCURSOR_THEME", "rose-pine-hyprcursor")
hl.env("HYPRCURSOR_SIZE", "32")
```

Danach:

```bash
hyprctl reload
```

---

## 8. XCursor-Version für Steam und andere XWayland-Programme installieren

`rose-pine-hyprcursor` allein reicht für Steam nicht aus.

Steam benötigt ein klassisches XCursor-Theme.

Installierte Rosé-Pine-XCursor-Themes prüfen:

```bash
find /usr/share/icons ~/.local/share/icons ~/.icons \
  -mindepth 1 -maxdepth 1 -type d \
  -exec test -d '{}/cursors' ';' -print 2>/dev/null |
grep -iE 'rose|pine'
```

Auf dem System vorhanden:

```text
/usr/share/icons/BreezeX-RosePine-Linux
/usr/share/icons/BreezeX-RosePineDawn-Linux
```

Für das normale dunkle Rosé-Pine-Theme:

```text
BreezeX-RosePine-Linux
```

---

## 9. Rosé Pine XCursor für Steam/XWayland auf Größe 32 setzen

Kompletter Setup-Block:

```bash
rm -rf ~/.local/share/icons/default
mkdir -p ~/.local/share/icons/default

cp -a /usr/share/icons/BreezeX-RosePine-Linux/. \
  ~/.local/share/icons/default/

mkdir -p ~/.icons
rm -rf ~/.icons/default
cp -a /usr/share/icons/BreezeX-RosePine-Linux \
  ~/.icons/default

cat > ~/.Xresources <<'EOF'
Xcursor.theme: BreezeX-RosePine-Linux
Xcursor.size: 32
EOF

mkdir -p ~/.config/environment.d
cat > ~/.config/environment.d/90-xcursor.conf <<'EOF'
XCURSOR_THEME=BreezeX-RosePine-Linux
XCURSOR_SIZE=32
XCURSOR_PATH=/usr/share/icons:$HOME/.local/share/icons:$HOME/.icons
EOF

gsettings set org.gnome.desktop.interface cursor-theme 'BreezeX-RosePine-Linux'
gsettings set org.gnome.desktop.interface cursor-size 32

xrdb -merge ~/.Xresources 2>/dev/null || true

pkill -f steam 2>/dev/null || true
```

Danach komplett aus Omarchy ausloggen und wieder einloggen.

Die endgültige Aufteilung ist:

```text
Hyprland / native Hyprcursor:
rose-pine-hyprcursor
Größe: 32

Steam / XWayland / GTK / XCursor:
BreezeX-RosePine-Linux
Größe: 32
```

---

## 10. Cursor-Konfiguration prüfen

Nach einem neuen Login:

```bash
echo "$HYPRCURSOR_THEME"
echo "$HYPRCURSOR_SIZE"
echo "$XCURSOR_THEME"
echo "$XCURSOR_SIZE"
echo "$XCURSOR_PATH"
```

Erwartet:

```text
rose-pine-hyprcursor
32
BreezeX-RosePine-Linux
32
```

XCursor-Dateien prüfen:

```bash
ls /usr/share/icons/BreezeX-RosePine-Linux/cursors | head
```

Default-Kopie prüfen:

```bash
ls ~/.local/share/icons/default/cursors | head
```

---

## 11. Bracketed Paste in Bash reparieren

Falls beim Einfügen Zeichen wie diese erscheinen:

```text
^[[200~
```

Status prüfen:

```bash
bind -v | grep bracketed
```

Für die aktuelle Shell aktivieren:

```bash
bind 'set enable-bracketed-paste on'
```

Permanent in `~/.inputrc`:

```bash
echo 'set enable-bracketed-paste on' >> ~/.inputrc
```

Neu laden:

```bash
bind -f ~/.inputrc
```

Falls der Terminalzustand kaputt ist:

```bash
reset
```

---

## 12. Bluetooth bei mehreren Adaptern manuell initialisieren

Bluetooth-Controller anzeigen:

```bash
bluetoothctl list
```

Interaktive Bluetooth-Shell starten:

```bash
bluetoothctl
```

Darin:

```text
select <MAC-DES-GEWÜNSCHTEN-CONTROLLERS>
power on
scan on
```

USB-Geräte zur Identifikation anzeigen:

```bash
lsusb
```

Bluetooth-Geräte prüfen:

```bash
rfkill list
```

Controller-Zuordnung untersuchen:

```bash
for h in hci1 hci2; do
  echo "=== $h ==="
  udevadm info -q property -p /sys/class/bluetooth/$h \
    | grep -E 'ID_VENDOR_ID|ID_MODEL_ID|ID_VENDOR=|ID_MODEL='
done
```

---

## 13. Secure Boot für Omarchy

Im ASUS-UEFI:

```text
Secure Boot
→ OS Type
→ Other OS
```

UEFI selbst bleibt aktiviert.

Keine Secure-Boot-Keys löschen.

---

## 14. Windows-Hibernation/Fast-Startup für gemeinsames NTFS deaktivieren

Unter Windows als Administrator:

```powershell
powercfg /h off
```

Das verhindert Probleme beim gemeinsamen Zugriff auf NTFS-Partitionen aus Windows und Linux.

## Disable internal bluetooth adapter

```sh
echo 'ACTION=="add", SUBSYSTEM=="usb", ATTR{idVendor}=="13d3", ATTR{idProduct}=="3602", ATTR{authorized}="0"' | \
  sudo tee /etc/udev/rules.d/81-disable-internal-bluetooth.rules
```

## Windows-like autoscroll

### Chrome

```sh
yay -S middleclick-autoscroll
middleclick-autoscroll
```

### Rest

https://github.com/estebanhiram/hypr-autoscroll

```sh
omarchy pkg add cmake cpio pkgconf git gcc

hyprpm update

bash <(curl -fsSL https://raw.githubusercontent.com/estebanhiram/hypr-autoscroll/main/scripts/setup-omarchy.sh)
```

https://github.com/estebanhiram/hypr-autoscroll#configuration

```lua
hl.config({
  plugin = {
    hypr_autoscroll = {
      enabled = true,
      direct_activation = false,
      button = 274,
      dead_zone = 12.0,
      sensitivity = 4.0,
      acceleration = 1.075,
      max_speed = 1500.0,
      horizontal = true,
      vertical = true,
      frame_interval_ms = 16,
    },
  },
})
```

## Cursor

https://www.gnome-look.org/p/1932768

```sh
set -euo pipefail

THEME="Simp1e-Rose-Pine"
THEME_DIR="/usr/share/icons/$THEME"
CURSOR_SIZE="32"

yay -S --needed xcursor-simp1e-rose-pine

test -d "$THEME_DIR/cursors" || {
  echo "FEHLER: $THEME_DIR/cursors existiert nicht"
  exit 1
}

mkdir -p ~/.local/share/icons
mkdir -p ~/.icons
mkdir -p ~/.config/environment.d

rm -rf ~/.local/share/icons/"$THEME"
cp -a "$THEME_DIR" ~/.local/share/icons/"$THEME"

rm -rf ~/.icons/"$THEME"
cp -a "$THEME_DIR" ~/.icons/"$THEME"

rm -rf ~/.local/share/icons/default
mkdir -p ~/.local/share/icons/default
cp -a "$THEME_DIR"/. ~/.local/share/icons/default/

rm -rf ~/.icons/default
mkdir -p ~/.icons/default
cp -a "$THEME_DIR"/. ~/.icons/default/

cat > ~/.config/environment.d/90-xcursor.conf <<EOF
XCURSOR_THEME=$THEME
XCURSOR_SIZE=$CURSOR_SIZE
XCURSOR_PATH=$HOME/.local/share/icons:$HOME/.icons:/usr/share/icons
EOF

cat >> ~/.config/hypr/hyprland.lua <<EOF

-- Simp1e Rose Pine XCursor
hl.env("XCURSOR_THEME", "$THEME")
hl.env("XCURSOR_SIZE", "$CURSOR_SIZE")
hl.env("XCURSOR_PATH", "$HOME/.local/share/icons:$HOME/.icons:/usr/share/icons")
EOF

gsettings set org.gnome.desktop.interface cursor-theme "$THEME"
gsettings set org.gnome.desktop.interface cursor-size "$CURSOR_SIZE"

cat > ~/.Xresources <<EOF
Xcursor.theme: $THEME
Xcursor.size: $CURSOR_SIZE
EOF

command -v xrdb >/dev/null 2>&1 && xrdb -merge ~/.Xresources || true

export XCURSOR_THEME="$THEME"
export XCURSOR_SIZE="$CURSOR_SIZE"
export XCURSOR_PATH="$HOME/.local/share/icons:$HOME/.icons:/usr/share/icons"

systemctl --user import-environment \
  XCURSOR_THEME \
  XCURSOR_SIZE \
  XCURSOR_PATH 2>/dev/null || true

if command -v dbus-update-activation-environment >/dev/null 2>&1; then
  dbus-update-activation-environment \
    --systemd \
    XCURSOR_THEME \
    XCURSOR_SIZE \
    XCURSOR_PATH
fi

hyprctl reload

echo
echo "Theme: $THEME"
echo "Größe: $CURSOR_SIZE"
echo "Danach einmal komplett ausloggen und wieder einloggen."
```

## OnlyOffice

```sh
yay -S onlyoffice-bin
desktopeditors
```
