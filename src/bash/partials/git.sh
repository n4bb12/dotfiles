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
