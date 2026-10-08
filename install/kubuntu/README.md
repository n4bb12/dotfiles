# Kubuntu setup

## Update packages

```sh
sudo apt update
sudo apt upgrade
```

## Bypass password min length

```sh
sudo passwd "$USER"
```

## Install NVIDIA Drivers

```sh
sudo apt update
sudo apt full-upgrade
sudo ubuntu-drivers devices
sudo ubuntu-drivers install
sudo reboot
```

## Configure system

- System Theme: Kubuntu Dark
- Display Scale: 150%
- Monospace font: Fira Code Retina
- Login Screen (SDDM): set an image
- Screen Locking: Bing image
- Wallpaper: Bing image
- Disable annoying window effects:

```sh
kwriteconfig6 --file kwinrc --group Plugins --key translucencyEnabled false
kwriteconfig6 --file kwinrc --group Plugins --key wobblywindowsEnabled false
```

## Headphones

- Open Bluetooth settings
- Pair WH-1000XM4

## Install software (via apt)

Text after `#` is a comment. A line that is only a comment is skipped.

```sh
libs="
# toolchain
build-essential # used by Homebrew
flatpak

# browser and terminal
firefox # Ubuntu package starts the Firefox snap
kitty
fonts-firacode

# desktop
steam-installer
gimp
gnome-calculator
openrgb
skanpage
video-downloader
vlc

# hardware
vainfo # VA-API
libguestfs-tools # read-only WSL VHDX
"

echo "$libs" | cut -d'#' -f1 | xargs -r sudo apt install -y
```

## Install software (via flatpak)

```sh
libs="
com.obsproject.Studio # OBS Studio
de.bund.ausweisapp.ausweisapp2 # AusweisApp
"

echo "$libs" | cut -d'#' -f1 | xargs -r flatpak install -y flathub
```

## Install software (via snap)

```sh
libs="
cameractrls
onlyoffice-desktopeditors
"

echo "$libs" | cut -d'#' -f1 | xargs -r sudo snap install
```

## Install software (download)

- Chrome https://www.google.com/intl/de/chrome/
- Cursor https://cursor.com/de/download
- VSCode https://code.visualstudio.com/download
- 1Password https://1password.com/downloads/linux
- Signal https://signal.org/de/download/
- Slack https://slack.com/intl/de-de/downloads/linux
- Discord https://discord.com/download
- OpenWhispr https://openwhispr.com/de
- Vibe Typer https://dev.vibetyper.com/downloads
- LinuxBroadcast https://github.com/Pedrojok01/linux-broadcast/releases (see section below)

Open Chrome.

Stirling PDF:

```sh
wget https://files.stirlingpdf.com/linux-installer.deb
sudo dpkg -i linux-installer.deb
rm linux-installer.deb
```

## Vibe Typer

Linux is an AppImage: a self-contained executable, not a package-manager app. Keep it in `~/Applications` and add a KDE launcher. Delete the copy in `Downloads` after moving it. Updating means replacing `~/Applications/VibeTyper.AppImage` unless Vibe Typer ships its own updater.

```sh
mkdir -p ~/Applications
mv ~/Downloads/VibeTyper*.AppImage ~/Applications/VibeTyper.AppImage
chmod +x ~/Applications/VibeTyper.AppImage

mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/vibetyper.desktop <<EOF
[Desktop Entry]
Name=Vibe Typer
Comment=Voice typing
Exec=$HOME/Applications/VibeTyper.AppImage
Terminal=false
Type=Application
Categories=Utility;
StartupNotify=true
EOF

kbuildsycoca6 --noincremental
```

It then appears in the KDE application launcher. Right-click to pin it to the task manager or favorites. To start it at login: **System Settings → Autostart → Add New → Application → Vibe Typer**.

## LinuxBroadcast

Virtual webcam with background blur/replace for Meet / Zoom / OBS. Install the `.deb` from GitHub Releases (not from source for everyday use).

```sh
VERSION=0.4.0
mkdir -p ~/Downloads
cd ~/Downloads
gh release download "v$VERSION" --repo Pedrojok01/linux-broadcast \
  --pattern "linux-broadcast_${VERSION}-1_amd64.deb"
sudo apt install -y "./linux-broadcast_${VERSION}-1_amd64.deb"
```

The package installs `v4l2loopback` options for `/dev/video10` (`card_label=LinuxBroadcast`). If an older OBS drop-in owns that device number, move it aside so LinuxBroadcast's config wins:

```sh
sudo mv /etc/modprobe.d/v4l2loopback.conf \
  /etc/modprobe.d/v4l2loopback.conf.obs-bak 2>/dev/null || true
```

### Secure Boot (required once)

DKMS signs `v4l2loopback` with the machine MOK. Until that key is enrolled, `modprobe` fails with `Key was rejected by service` and `/dev/video10` never appears.

```sh
sudo mokutil --import /var/lib/shim-signed/mok/MOK.der
sudo reboot
```

At the blue **Perform MOK management** screen: **Enroll MOK → Continue → Yes →** enter the one-time password → reboot. Then:

```sh
sudo modprobe v4l2loopback
ls /dev/video10
linux-broadcast
```

In the app: pick the camera, background mode, and enable **Start on login** (writes `~/.config/autostart/LinuxBroadcast-autostart.desktop` with `--headless`). In Meet / Zoom / OBS pick the camera named **LinuxBroadcast**.

### Tray vs taskbar on Wayland

On Plasma Wayland, Close / Hide cannot unmap the window — xdg-shell has no hide verb — so the app minimizes instead. Use the **system tray** icon to show the window or **Quit**. To keep the taskbar entry away during permanent use, add a KWin window rule (skip if you already manage `kwinrulesrc` yourself and merge by hand):

```sh
cat > ~/.config/kwinrulesrc <<'EOF'
[General]
count=1
rules=1

[1]
Description=LinuxBroadcast: keep off the taskbar (tray app)
wmclass=linuxbroadcast
wmclassmatch=2
wmclasscomplete=false
skiptaskbar=true
skiptaskbarrule=1
skippager=true
skippagerrule=1
skipswitcher=true
skipswitcherrule=1
EOF

qdbus6 org.kde.KWin /KWin org.kde.KWin.reconfigure
```

Restart LinuxBroadcast once so the rule applies. Tray left-click / menu **Show** brings the window back; **Quit** exits.

### GPU (optional)

CPU segmentation works without extras. The stock `linux-broadcast-cuda` addon needs CUDA 13 + cuDNN 9, and the prebuilt ONNX CUDA provider does **not** support Blackwell (RTX 50 / SM 120) — the app falls back to CPU. A custom ONNX Runtime build for `CMAKE_CUDA_ARCHITECTURES=120` is required for GPU on this machine; follow the upstream README section *New NVIDIA architectures*.

## Configure Chrome

- Enable sticky scroll
- Make permission bubbles clickable on Wayland

```sh
cp /usr/share/applications/google-chrome.desktop \
  ~/.local/share/applications/google-chrome.desktop
sed -i 's|Exec=/usr/bin/google-chrome-stable|Exec=/usr/bin/google-chrome-stable --enable-blink-features=MiddleClickAutoscroll --disable-features=OzoneBubblesUsePlatformWidgets|' \
  ~/.local/share/applications/google-chrome.desktop

kbuildsycoca6 --noincremental
pkill -f chrome
```

Chrome paints notification, camera, and location prompts as extra Wayland surfaces. On KDE those surfaces drop clicks, so Allow does nothing. `--disable-features=OzoneBubblesUsePlatformWidgets` draws the bubble in the browser window instead.

Middle click in Chrome is autoscroll only. Pasting stays on right click in Kitty. KWin stops offering the Wayland primary selection, which is what Chrome pastes on middle click. Log out and back in after changing it. Already open Chrome windows keep the old behavior until Chrome is restarted.

```sh
kwriteconfig6 --file kwinrc --group Wayland --key EnablePrimarySelection false
```

## 1Password

- Sign in to 1Password
- Sign in to account to install extensions
- Sign in to 1Password extension
- Pair 1Password accounts
- Install 1Password App

## Install messaging apps

- https://web.telegram.org/k/
- https://web.whatsapp.com/
- https://teams.cloud.microsoft/

## Install NVM

https://github.com/nvm-sh/nvm#install--update-script

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
```

## Install Homebrew

https://brew.sh/

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
echo '' >> ~/.bashrc
echo '# brew' >> ~/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
```

## Install software (via brew)

```sh
libs="
oven-sh/bun/bun # Bun's own tap
1password-cli
ast-grep
cloudflared
deno
ffmpeg
fzf
gh
git-crypt
git-lfs
glab
killport
kubernetes-cli # kubectl
kustomize
openjdk
ripgrep
shfmt
claude-code
"

brew tap oven-sh/bun
brew trust oven-sh/bun
echo "$libs" | cut -d'#' -f1 | xargs -r brew install
```

## Install software (via bun)

```sh
libs="
@biomejs/biome
@openai/codex
@playwright/cli
@schpet/linear-cli
@sentry/cli
@shopify/cli
agent-browser
fx
nodemon
npm-check-updates
open-cli
pnpm
prettier
release-it
serve
skills
slugify-cli
sort-package-json
supabase
vercel
yarn
"

echo "$libs" | cut -d'#' -f1 | xargs -r bun i -g
```

## Install Docker

https://docs.docker.com/engine/install/ubuntu/

## GPG key

```sh
gpg --full-generate-key
```

## Configure git

Execute git config https://github.com/n4bb12/dotfiles/blob/main/install/git.sh

```sh
ssh-keygen -t ed25519 -C $(git config user.email)
```

```sh
cat ~/.ssh/id_ed25519.pub
```

Add SSH key to GitHub https://github.com/settings/keys

Clone repositories https://github.com/n4bb12?tab=repositories

## Configure dotfiles

```sh
mkdir -p ~/code/n4bb12
git clone git@github.com:n4bb12/dotfiles.git ~/code/n4bb12/dotfiles
echo '' >> ~/.bashrc
echo '# dotfiles' >> ~/.bashrc
echo 'source ~/code/n4bb12/dotfiles/aliases/_index.sh' >> ~/.bashrc
```

## Portainer

https://docs.portainer.io/start/install-ce/server/docker/linux#docker-compose

```sh
sudo docker compose -f ~/code/n4bb12/dotfiles/install/kubuntu/portainer-compose.yaml up -d
```

## Configure terminal

Kitty replaces Konsole. Ctrl+Alt+T and Super+Enter open Kitty in `~/code` via `kitty.desktop`. Open Terminal Here uses `kitty-here.desktop` (`Exec=kitty`) so the clicked folder is kept. KDE only sets the process working directory for Kitty, and `--directory` overrides it. The shortcuts apply after the next login. `kitty.conf` uses Fira Code Retina, which `fonts-firacode` installs.

```sh
mkdir -p ~/.config/kitty ~/.local/share/applications
ln -sfn ~/code/n4bb12/dotfiles/config/~/.config/kitty/kitty.conf ~/.config/kitty/kitty.conf
ln -sfn ~/code/n4bb12/dotfiles/config/~/.config/kitty/tab_bar.py ~/.config/kitty/tab_bar.py
ln -sfn ~/code/n4bb12/dotfiles/config/~/.config/kitty/rename_tab.py ~/.config/kitty/rename_tab.py
ln -sfn ~/code/n4bb12/dotfiles/config/~/.local/share/applications/kitty.desktop ~/.local/share/applications/kitty.desktop
ln -sfn ~/code/n4bb12/dotfiles/config/~/.local/share/applications/kitty-here.desktop ~/.local/share/applications/kitty-here.desktop

kwriteconfig6 --file kdeglobals --group General --key TerminalApplication kitty
kwriteconfig6 --file kdeglobals --group General --key TerminalService kitty-here.desktop

kwriteconfig6 --file kglobalshortcutsrc --group services --group org.kde.konsole.desktop --key _launch none
kwriteconfig6 --file kglobalshortcutsrc --group services --group kitty.desktop --key _launch $'Ctrl+Alt+T\tMeta+Return'

sudo update-alternatives --set x-terminal-emulator /usr/bin/kitty
```

## Color picker

Alt+C — Pick screen color and copy `#RRGGBB` to the clipboard.

KDE Plasma 6 on Wayland, using the native KWin ColorPicker. The notification shows a swatch of the sampled pixel. KWin only returns the color on click, so there is no live hover preview. `aliases/kubuntu.sh` puts `pick-color` on PATH. After installing the shortcut, log out and back in.

```sh
bash ~/code/n4bb12/dotfiles/install/kubuntu/pick-color.sh
```

Files this step manages:

- `~/.local/bin/pick-color`
- `~/.local/share/applications/com.n4bb12.dotfiles.pick-color.desktop`
- `~/.local/share/kglobalaccel/com.n4bb12.dotfiles.pick-color.desktop`
- `[services][com.n4bb12.dotfiles.pick-color.desktop]` `_launch` in `~/.config/kglobalshortcutsrc`

There is no uninstall command. Remove those files, then delete only that key:

```sh
kwriteconfig6 \
  --file kglobalshortcutsrc \
  --group services \
  --group com.n4bb12.dotfiles.pick-color.desktop \
  --key _launch \
  --delete \
  ''
```

## Show desktop

KWin has no minimize-all shortcut. Super+D is Peek at Desktop, which only hides windows and brings them all back together. This script minimizes instead, and a second press restores that set unless a window was opened in between.

```sh
bash ~/code/n4bb12/dotfiles/install/kubuntu/show-desktop.sh
```

The shortcut is active immediately. It is loaded again on the next login.

## Emoji picker

```sh
bash ~/code/n4bb12/dotfiles/install/kubuntu/pick-emoji.sh
```

Log out and back in.

# Windows dual boot

`libguestfs-tools` is in the apt list above.

## Mount windows partitions

```sh
sudo mkdir -p /mnt/windows /mnt/data

sudo cp /etc/fstab /etc/fstab.backup

printf '\n# Windows, read-only\nUUID=863E271D3E270631  /mnt/windows  ntfs3  ro,uid=%s,gid=%s,umask=022,nofail  0  0\n\n# Shared Data, read-write\nUUID=D8A85E6FA85E4C5E  /mnt/data  ntfs3  rw,uid=%s,gid=%s,umask=022,nofail  0  0\n' \
"$(id -u)" "$(id -g)" "$(id -u)" "$(id -g)" | sudo tee -a /etc/fstab

sudo systemctl daemon-reload
sudo mount -a

findmnt /mnt/windows
findmnt /mnt/data
```

## Mount WSL Disk

```sh
VHDX=/mnt/windows/WSL/Ubuntu/ext4.vhdx
MNT=/mnt/wsl
UID_="$(id -u)"
GID_="$(id -g)"

sudo mkdir -p "$MNT"

# allow_other für FUSE erlauben
grep -qxF user_allow_other /etc/fuse.conf \
  || echo user_allow_other | sudo tee -a /etc/fuse.conf

# Eventuell bestehenden guestmount aushängen
sudo guestunmount "$MNT" 2>/dev/null || true

# WSL VHDX automatisch read-only mounten
printf '[Unit]\nDescription=Mount WSL VHDX read-only\nRequiresMountsFor=/mnt/windows\nAfter=local-fs.target\n\n[Service]\nType=simple\nExecStart=/usr/bin/guestmount --no-fork --ro -a %s -m /dev/sda -o allow_other -o uid=%s -o gid=%s %s\nExecStop=/usr/bin/guestunmount %s\nRestart=on-failure\nRestartSec=2\n\n[Install]\nWantedBy=multi-user.target\n' \
"$VHDX" "$UID_" "$GID_" "$MNT" "$MNT" \
| sudo tee /etc/systemd/system/wsl-vhdx.service

sudo systemctl daemon-reload
sudo systemctl enable wsl-vhdx.service
sudo systemctl restart wsl-vhdx.service

findmnt "$MNT"
ls "$MNT/home"
```
