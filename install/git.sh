#!/usr/bin/env bash
DIR=$(cd $(dirname $0) && pwd)
set -ex

git config --global --unset-all user.email || true
git config --global --unset-all user.name || true
git config --global alias.lg 'log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
git config --global color.ui auto
git config --global core.attributesFile ~/.gitattributes
git config --global core.autocrlf false
git config --global core.editor 'code --wait'
git config --global core.eol lf
git config --global core.excludesfile ~/.gitignore
git config --global core.ignorecase false
git config --global diff.tool 'code'
git config --global difftool.code.cmd 'code --wait --diff $LOCAL $REMOTE'
git config --global fetch.prune true
git config --global log.date iso
git config --global pager.branch false
git config --global pull.rebase true
git config --global push.default current
git config --global push.followTags true
git config --global rebase.autosquash true
git config --global user.name "Abraham Schilling"
