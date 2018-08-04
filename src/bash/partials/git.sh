#  
# 
#   Git Aliases
#   https://git-scm.com/docs
# 
# ==========================================================

require-binary "git"

git-chmod() {
  git update-index --chmod="$1"
}

alias gm="git-msg"
