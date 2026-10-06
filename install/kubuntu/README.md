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
v4l-utils
v4l2loopback-dkms # OBS virtual camera
"

echo "$libs" | cut -d'#' -f1 | xargs -r sudo apt install -y
```

## Install software (via flatpak)

```sh
libs="
com.obsproject.Studio # OBS Studio
com.obsproject.Studio.Plugin.BackgroundRemoval
com.github.wwmm.easyeffects # microphone effects, includes RNNoise
hu.irl.cameractrls # Facecam controls
de.bund.ausweisapp.ausweisapp2 # AusweisApp
"

echo "$libs" | cut -d'#' -f1 | xargs -r flatpak install -y flathub
```

## Install software (via snap)

```sh
libs="
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

## Configure Chrome

- Enable sticky scroll
- Fix Netflix black screen bug

```sh
cp /usr/share/applications/google-chrome.desktop \
  ~/.local/share/applications/google-chrome.desktop
sed -i 's|Exec=/usr/bin/google-chrome-stable %U|Exec=/usr/bin/google-chrome-stable --enable-blink-features=MiddleClickAutoscroll --use-gl=egl %U|' \
  ~/.local/share/applications/google-chrome.desktop

kbuildsycoca6 --noincremental
pkill -f chrome
```

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

## Emoji picker

```sh
bash ~/code/n4bb12/dotfiles/install/kubuntu/pick-emoji.sh
```

Log out and back in.

## Elgato

Facecam MK.2, Wave:3, and Key Light MK.2.

```text
Elgato Facecam → cameractrls → OBS + Background Removal → OBS Virtual Camera → applications
Elgato Wave:3 → Easy Effects preset Meetings → Easy Effects Source → applications
```

The Ubuntu `easyeffects` package has no RNNoise, so microphone processing uses the Flatpak. Cameractrls comes from Flathub. LimeLight is not on Flathub:

```sh
curl -fL -o /tmp/LimeLight.flatpak \
  https://github.com/Chimi6/limelight-linux-elgato-lights-controller/releases/download/v0.3.1/LimeLight.flatpak
flatpak install --user -y /tmp/LimeLight.flatpak
```

`keylightd` listens on `http://127.0.0.1:9124`. `GET /v1/lights/states`.

```sh
mkdir -p ~/.config/systemd/user
cp ~/code/n4bb12/dotfiles/install/kubuntu/cameractrlsd.service ~/.config/systemd/user/
cp ~/code/n4bb12/dotfiles/install/kubuntu/keylightd.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now cameractrlsd.service keylightd.service
```

`cameractrlsd` restores preset 1 when the Facecam appears. Change exposure, gain, white balance, zoom, and pan/tilt in Cameractrls, then save preset 1.

```sh
ee_data=~/.var/app/com.github.wwmm.easyeffects/data/easyeffects
mkdir -p "$ee_data/input"
cp ~/code/n4bb12/dotfiles/install/kubuntu/easyeffects-meetings.json "$ee_data/input/Meetings.json"
```

Autoload is one JSON file per microphone route. On this machine the Wave:3 route is `Microphone`, and the file is `alsa_input…mono-fallback:Microphone.json` with `"preset-name": "Meetings"`. Easy Effects starts at login and does not take over speaker playback.

OBS scene collection `Meetings` puts `~/Pictures/obs-hintergrund.png` under the Facecam. The camera has a Crop filter and Background Removal. Replace the image in the source properties, then crop and place the camera in the preview. OBS starts the virtual camera at login.

`v4l2loopback` is unsigned until Secure Boot enrolls the DKMS key. After `apt install`, reboot and confirm the blue MOK screen. In Meet, Zoom, Teams, and Discord choose **OBS Virtual Camera** and **Easy Effects Source**.

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
