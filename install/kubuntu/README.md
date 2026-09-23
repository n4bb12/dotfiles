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

Change system theme

```
Kubuntu Dark
```

Set Display Scale

```
150%
```

Disable annoying window effects

```sh
kwriteconfig6 --file kwinrc --group Plugins --key translucencyEnabled false
kwriteconfig6 --file kwinrc --group Plugins --key wobblywindowsEnabled false
```

Change monospace font

```
DejaVu Sans Mono 10pt
```

Configure login screen (SDDM)

## Configure terminal

- Configure Konsole
- Configure Keyboard Shortcuts
- Hide Menu

## Headphones

- Open Bluetooth settings
- Pair WH-1000XM4

## Install initial browser

```sh
sudo apt install firefox
```

## Install default browser

https://www.google.com/intl/de/chrome/

Open Chrome

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

## Install software (via .deb)

- Cursor https://cursor.com/de/download
- VSCode https://code.visualstudio.com/download
- 1Password https://1password.com/downloads/linux

## 1Password

- Sign in to 1Password
- Sign in to account to install extensions
- Sign in to 1Password extension
- Pair 1Password accounts
- Install 1Password App

## Install software (via Discover)

- Steam
- Discord
- OnlyOffice

## Install messaging apps

- https://web.telegram.org/k/
- https://web.whatsapp.com/
- https://signal.org/de/download/
- https://slack.com/intl/de-de/downloads/linux
- https://teams.cloud.microsoft/

## Install STT App

https://openwhispr.com/de

## Install software (manually)

Homebrew https://brew.sh/

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
echo '' >> ~/.bashrc
echo '# brew' >> ~/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
sudo apt-get install build-essential
```

NVM https://github.com/nvm-sh/nvm#install--update-script

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
```

## Install software (via brew)

```sh
brew tap oven-sh/bun
brew trust oven-sh/bun

xargs brew install <<EOF || true
1password-cli
ast-grep
bun
cloudflared
deno
ffmpeg
fzf
gh
git-crypt
git-lfs
glab
jq
killport
kubernetes-cli
kustomize
openjdk
ripgrep
shfmt
EOF
```

## Install software (via bun)

```sh
xargs bun i -g <<EOF || true
@biomejs/biome
@playwright/cli
@shopify/cli
agent-browser
fx
nodemon
npm-check-updates
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
EOF
```

## Install Docker

- Docker https://docs.docker.com/engine/install/ubuntu/
- Portainer https://docs.portainer.io/start/install-ce/server/docker/linux#docker-compose

```sh
sudo docker compose -f install/kubuntu/portainer-compose.yaml up -d
```

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
git clone git@github.com:n4bb12/dotfiles.git
echo '' >> ~/.bashrc
echo '# dotfiles' >> ~/.bashrc
echo 'source ~/code/n4bb12/dotfiles/aliases/_index.sh' >> ~/.bashrc
```

## Color picker

Alt+Shift+C — Pick screen color and copy `#RRGGBB` to the clipboard.

KDE Plasma 6 on Wayland, using the native KWin ColorPicker. The notification shows a swatch of the sampled pixel. KWin only returns the color on click, so there is no live hover preview. `aliases/kubuntu.sh` puts `pick-color` on PATH. After installing the shortcut, log out and back in.

```sh
bash install/kubuntu/pick-color.sh
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

## PDF Tools

```sh
wget https://files.stirlingpdf.com/linux-installer.deb
sudo dpkg -i linux-installer.deb
rm linux-installer.deb
```

# Windows dual boot

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

sudo apt update
sudo apt install -y libguestfs-tools

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
