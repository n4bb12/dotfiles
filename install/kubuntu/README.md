# Kubuntu setup

## Update packages

```sh
sudo apt update
sudo apt upgrade
```

## Install NVIDIA Drivers

```sh
sudo apt update
sudo apt full-upgrade
sudo ubuntu-drivers devices
sudo ubuntu-drivers install
sudo reboot
```

## Bypass password min length

```sh
sudo passwd "$USER"
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

## Install initial browser

```sh
sudo apt install firefox
```

## Install default browser

https://www.google.com/intl/de/chrome/

Open Chrome

## GPG key

```sh
gpg --full-generate-key
```

## 1Password

- Sign in to 1Password
- Sign in to account to install extensions
- Sign in to 1Password extension
- Pair 1Password accounts
- Install 1Password App

## Headphones

- Open Bluetooth settings
- Pair WH-1000XM4

## Install software (via Discover)

- Steam
- Discord

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

## Install software (via .deb)

- Cursor https://cursor.com/de/download
- VSCode https://code.visualstudio.com/download

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
bun i -g @biomejs/biome
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

## Configure terminal

- Configure Konsole
- Configure Keyboard Shortcuts
- Hide Menu
