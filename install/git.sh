#!/usr/bin/env bash
DIR=$(cd $(dirname $0) && pwd)
set -ex

git config --global --add safe.directory "*"
git config --global --unset-all user.email || true
git config --global --unset-all user.name || true
git config --global alias.lg 'log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
git config --global alias.ref 'reflog --pretty="%C(auto)%h %<|(20)%gd %C(blue)%cr%C(reset) %gs (%s)"'
git config --global color.ui auto
git config --global core.attributesFile ~/.gitattributes
git config --global core.autocrlf false
git config --global core.editor 'code --wait --reuse-window'
git config --global core.eol lf
git config --global core.excludesfile ~/.gitignore
git config --global core.fsmonitor true
git config --global core.ignorecase false
git config --global core.untrackedCache true
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --reuse-window --diff $LOCAL $REMOTE'
git config --global fetch.prune true
git config --global fetch.writeCommitGraph true
git config --global gpg.format ssh
git config --global grep.extendRegexp true
git config --global grep.lineNumber true
git config --global init.defaultBranch main
git config --global log.date iso
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait --reuse-window $MERGED'
git config --global pager.branch false
git config --global pager.grep false
git config --global pager.log false
git config --global pull.rebase true
git config --global push.autoSetupRemote true
git config --global push.default current
git config --global push.followTags true
git config --global rebase.autosquash true
git config --global rerere.enabled true
git config --global user.name "Abraham Schilling"
git config --global user.signingkey ~/.ssh/id_ed25519.pub
