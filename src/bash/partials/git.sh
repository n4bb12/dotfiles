#  
# 
#   Git Aliases
#   https://git-scm.com/docs
# 
# ==========================================================

require-binary "git"

git-msg() {
  git log -1 --pretty=%B
}

git-chmod() {
  git update-index --chmod="$1"
}

alias gm="git-msg"

git config --global alias.amend "commit --ammend --no-edit"
git config --global alias.fix "commit --fixup"
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
git config --global push.followTags true
