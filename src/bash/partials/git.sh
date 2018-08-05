#  
# 
#   Git Aliases
#   https://git-scm.com/docs
# 
# ==========================================================

require-binary "git"

alias add="git add -A ."
alias amend="git commit --amend --no-edit"
alias branches="git branch -a"
alias checkout="git checkout"
alias cherry="git cherry-pick"
alias chmod="git update-index --chmod"
alias diff="git --no-pager diff"
alias fetch="git fetch --prune"
alias fix="git commit --fixup"
alias ibase="git rebase -i origin/$(git rev-parse --abbrev-ref HEAD)"
alias log="git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
alias outb="checkout -b"
alias reset="git reset"
alias show="git --no-pager show"
alias status="git --no-pager status"

alias bra="branches"
alias cm="commit"
alias lg="log"
alias mit="commit"
alias out="checkout"
alias st="status"
alias stat="status"
