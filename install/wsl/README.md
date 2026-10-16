# WSL setup

Ubuntu 26.04 on WSL 2. GUI apps, Cursor, Chrome and 1Password run on Windows (`install/windows/apps.md`). This covers the Linux side.

## WSL

Turn on systemd so Docker starts with the distro.

```sh
sudo tee /etc/wsl.conf >/dev/null <<EOF
[boot]
systemd=true

[user]
default=$USER
EOF
```

Run `wsl --shutdown` in PowerShell, then open Ubuntu again. `.wslconfig` (memory, swap) is copied in [Config files](#config-files).

## Update packages

```sh
sudo apt update
sudo apt upgrade -y
```

## Install software (via apt)

Text after `#` is a comment. A line that is only a comment is skipped.

```sh
libs="
build-essential # native node modules
bash-completion
ca-certificates
curl
file
git
git-crypt
procps
unzip
wget
xz-utils
zip

fzf
jq
ripgrep
postgresql-client # psql
"

echo "$libs" | cut -d'#' -f1 | xargs -r sudo apt install -y
```



## SSH via 1Password

The keys stay in 1Password on Windows. `wsl2-ssh-agent` forwards the Windows agent into WSL and sets `SSH_AUTH_SOCK`.

In 1Password on Windows: **Settings → Developer → Use the SSH agent**.

```sh
mkdir -p ~/.local/bin
curl -fsSL https://github.com/mame/wsl2-ssh-agent/releases/latest/download/wsl2-ssh-agent -o ~/.local/bin/wsl2-ssh-agent
chmod +x ~/.local/bin/wsl2-ssh-agent

echo '' >> ~/.bashrc
echo '# WSL2 SSH Agent' >> ~/.bashrc
echo 'eval "$("$HOME/.local/bin/wsl2-ssh-agent")"' >> ~/.bashrc
source ~/.bashrc
```

1Password writes the public keys and a host config to `%USERPROFILE%\.ssh\1Password`. Copy them into WSL, because SSH rejects files on `/mnt/c` as too open.

```sh
W="$(wslpath "$(powershell.exe -NoProfile -Command '$env:USERPROFILE' | tr -d '\r')")"

mkdir -p ~/.ssh/1Password
cp "$W/.ssh/1Password/"* ~/.ssh/1Password/
chmod 700 ~/.ssh ~/.ssh/1Password
chmod 600 ~/.ssh/1Password/*
```

`github-personal` and `github-work` pick the matching key for `ssh` and the first clone below; git itself picks the key per GitHub owner (see "Configure git"). `IdentityAgent SSH_AUTH_SOCK` uses the socket from `wsl2-ssh-agent`, not `~/.1password/agent.sock` from `config/~/.ssh/config`.

```sh
cat > ~/.ssh/config <<'EOF'
Include ~/.ssh/1Password/config

Host github-personal
    HostName github.com
    User git

Host github-work
    HostName github.com
    User git

Host *
    IdentityAgent SSH_AUTH_SOCK
EOF

ssh -T git@github-personal
ssh -T git@github-work
```



## Configure dotfiles

```sh
mkdir -p ~/code/n4bb12
git clone git@github-personal:n4bb12/dotfiles.git ~/code/n4bb12/dotfiles
echo '' >> ~/.bashrc
echo '# dotfiles' >> ~/.bashrc
echo 'source "$HOME/code/n4bb12/dotfiles/aliases/_index.sh"' >> ~/.bashrc
source ~/.bashrc
```



## Configure git

```sh
bash ~/code/n4bb12/dotfiles/install/git.sh
```

Remotes stay `git@github.com:<owner>/<repo>`. Git picks the SSH key per owner with `includeIf "hasconfig:remote.*.url:…"` and `core.sshCommand`, instead of rewriting URLs to the `github-*` host aliases: tools that read `git remote -v`, such as stagCode/T3 Code, only recognize `github.com` and treat an alias as an unknown host. `install/git.sh` sets this up for `n4bb12` and points the dotfiles clone at `github.com`.

`install/git.sh` sets the personal email. If the machine commits as a different user, override it globally, add the work owner's key, and keep the personal email for the dotfiles repo only. `key` is the work key's file name in `~/.ssh/1Password` (`ssh -o IdentitiesOnly=yes -i ~/.ssh/1Password/$key -T git@github.com` greets the work account).

```sh
email=
org=
key=

git config --global user.email $email
printf '[core]\n\tsshCommand = ssh -o IdentitiesOnly=yes -i ~/.ssh/1Password/%s\n' "$key" > ~/.config/git/github-$org.gitconfig
git config --global "includeIf.hasconfig:remote.*.url:git@github.com:$org/**.path" "~/.config/git/github-$org.gitconfig"
git -C ~/code/n4bb12/dotfiles config user.email 6810177+n4bb12@users.noreply.github.com
```

## Config files

Copy what fits this machine. Files under `config/` are named by destination. Leave out `.ssh/config` (see above), Kitty and the KDE service menu.

```sh
D=~/code/n4bb12/dotfiles/config

cp "$D/~/.gitignore" "$D/~/.editorconfig" "$D/~/.prettierrc" "$D/~/.bunfig.toml" "$D/~/.release-it.json" ~/
mkdir -p ~/.agents ~/.aws
cp "$D/~/.agents/AGENTS.md" ~/.agents/
cp "$D/~/.aws/config" ~/.aws/
```

Windows side. Cursor runs on Windows and does not follow WSL symlinks, so these are copies. After changing a setting in Cursor or Windows Terminal, copy it back into the repo.

```sh
D=~/code/n4bb12/dotfiles/config
W="$(wslpath "$(powershell.exe -NoProfile -Command '$env:USERPROFILE' | tr -d '\r')")"
WT=AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState

cp "$D/%USERPROFILE%/.wslconfig" "$W/"
cp "$D/%USERPROFILE%/$WT/settings.json" "$W/$WT/"
cp "$D/cursor/settings.json" "$D/cursor/keybindings.json" "$W/AppData/Roaming/Cursor/User/"
```

`.wslconfig` applies after `wsl --shutdown`.

## Memory log

`memlog` shows how memory was used over a day, in WSL and on Windows: peaks, minutes in which every process waited on memory, which tool in which project grew during those minutes, and the `.wslconfig` limits in effect. A systemd user timer records a sample once a minute to `~/.local/state/memlog/` and keeps 14 days.

```sh
D=~/code/n4bb12/dotfiles/config

mkdir -p ~/.config/systemd/user
cp "$D/~/.config/systemd/user/memlog."* ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now memlog.timer
sudo loginctl enable-linger "$USER"
```

Linger keeps the timer running while no terminal is open. `memlog` reports today, `memlog yesterday` or `memlog 2026-10-16` another day.

## GitHub CLI

[https://github.com/cli/cli/blob/trunk/docs/install_linux.md](https://github.com/cli/cli/blob/trunk/docs/install_linux.md)

```sh
sudo mkdir -p -m 755 /etc/apt/keyrings
wget -nv -O- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
sudo apt update
sudo apt install -y gh

gh auth login
```



## Install NVM and Node

[https://github.com/nvm-sh/nvm#install--update-script](https://github.com/nvm-sh/nvm#install--update-script)

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```



## Install Bun

[https://bun.sh/docs/installation](https://bun.sh/docs/installation)

```sh
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```



## Install pnpm

[https://pnpm.io/installation](https://pnpm.io/installation)

Standalone, not through Bun. pnpm switches to the version in each repo's `packageManager` field.

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
```



## Install software (via bun)

```sh
libs="
@biomejs/biome
@playwright/cli
@schpet/linear-cli
agent-browser
npm-check-updates
sentry
vercel
"

echo "$libs" | cut -d'#' -f1 | xargs -r bun add -g
```



## Install AI CLIs

Each installer puts its binary in `~/.local/bin` and updates itself.

```sh
curl -fsSL https://claude.ai/install.sh | bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
curl -fsSL https://cursor.com/install | bash
```

`cursor` itself comes from the Windows install via `PATH`.

## Install Docker

Docker Engine inside WSL, without Docker Desktop. Uninstall Docker Desktop first if it is installed. Its `docker` stub on the Windows `PATH` only prints a hint.

[https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/)

```sh
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker "$USER"
```

Run `wsl --shutdown` in PowerShell so the group applies, then:

```sh
docker run --rm hello-world
```

Ports published by Compose are reachable from Windows on `localhost`.

## Verify

```sh
node -v && pnpm -v && bun -v && docker compose version && gh auth status
```

