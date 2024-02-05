#!/usr/bin/env bash
set -euo pipefail

# print OS version
lsb_release -a

# silence welcome message
touch ~/.hushlogin

# configure network
if ! grep -q 'generateResolvConf = false' /etc/wsl.conf; then
  echo -e '[network]\ngenerateResolvConf = false' | sudo tee -a /etc/wsl.conf
fi
if ! grep -q 'nameserver 1.1.1.3' /etc/resolv.conf; then
  sudo rm /etc/resolv.conf
  echo -e 'nameserver 1.1.1.3\nnameserver 1.0.0.3' | sudo tee /etc/resolv.conf
  sudo chattr +i /etc/resolv.conf
fi

# update apt package registries and packages
sudo apt update
sudo apt upgrade

# bash completion
# https://www.cyberciti.biz/faq/add-bash-auto-completion-in-ubuntu-linux/
sudo apt install bash-completion
source /etc/profile.d/bash_completion.sh

# apt packages
packages=(
  bat
  ca-certificates
  curl
  fd-find
  fzf
  git
  gum
  hyperfine
  python3
  unzip
  wget
)
sudo apt install ${packages[@]}

# gum
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://repo.charm.sh/apt/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/charm.gpg
echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | sudo tee /etc/apt/sources.list.d/charm.list
sudo apt update
sudo apt install gum

# git config
curl https://raw.githubusercontent.com/n4bb12/dotfiles/main/install/git.sh | bash

# github cli
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md#debian-ubuntu-linux-raspberry-pi-os-apt
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y

if ! gh auth status &> /dev/null; then
  gh auth login
fi

# dotfiles
# if ~/git/n4bb12/dotfiles does not exist, create it
if [ ! -d ~/git/n4bb12/dotfiles ]; then
  mkdir -p ~/git/n4bb12
  pushd ~/git/n4bb12
  git clone git@github.com:n4bb12/dotfiles.git
  popd
fi
ln -s -f ~/git/n4bb12/dotfiles/config/~/.aliases/ ~/.aliases
ln -s -f ~/git/n4bb12/dotfiles/install/ubuntu/install.sh ~/install.sh

# nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# node, npm
nvm install --lts

# npm config
npm config set color always
npm config set editor code
npm config set git-tag-version true
npm config set progress true
npm config set shell bash

# npm packages
  # @ffmpeg-installer/ffmpeg
packages=(
  bundle-phobia-cli
  fkill-cli
  fx
  jq
  nodemon
  npm-check-updates
  open-cli
  prettier
  release-it
  serve
  slugify-cli
  sort-package-json
  tldr
  tsx
  vercel
)
npm i -g ${packages[@]}
echo npm packages installed

# yarn
corepack enable

# bun
# https://bun.sh/
curl -fsSL https://bun.sh/install | bash

# heroku cli
# https://devcenter.heroku.com/articles/heroku-cli#standalone-installation-with-a-tarball
curl https://cli-assets.heroku.com/install.sh | sh

# aws cli
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws

# gcloud cli
sudo apt-get install apt-transport-https ca-certificates gnupg curl sudo
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
gcloud init
gcloud config set disable_usage_reporting True

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl kubectl.sha256
kubectl version --client

# kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo install -o root -g root -m 0755 kustomize /usr/local/bin/kustomize
rm kustomize
kustomize --version

# docker
# Uninstall old versions
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
# Install the Docker packages.
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
# Verify that the Docker Engine installation is successful by running the hello-world image.
sudo docker run hello-world

# Composer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer

# WP
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
php wp-cli.phar --info
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Maybe?
# doctl      https://github.com/digitalocean/doctl
# go         https://go.dev/
# op         https://developer.1password.com/docs/cli/get-started/
# railway    https://docs.railway.app/guides/cli
