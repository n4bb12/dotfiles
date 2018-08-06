#  
# 
#   Git Aliases
#   https://git-scm.com/docs
# 
# ==========================================================

require-binary "git"

alias      add="git add -A ."
alias      eol="git rm --cached -r ."
alias      fix="git commit --fixup"
alias      log="git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
alias     diff="git --no-pager diff"
alias     outb="checkout -b"
alias     pull="git pull"
alias     push="git push --follow-tags"
alias     show="git --no-pager show"
alias    amend="git commit --amend --no-edit"
alias    chmod="git update-index --chmod"
alias    fetch="git fetch --prune"
alias    ibase="git rebase -i origin/$(git rev-parse --abbrev-ref HEAD)"
alias    reset="git reset"
alias   branch="git rev-parse --abbrev-ref HEAD"
alias   cherry="git cherry-pick"
alias   status="git --no-pager status"
alias branches="git branch -a"
alias checkout="git checkout"
alias upstream="git branch --set-upstream-to origin/$(git rev-parse --abbrev-ref HEAD)"

alias   cm="commit"
alias   lg="log"
alias   st="status"
alias  bra="branches"
alias  mit="commit"
alias  out="checkout"
alias stat="status"
alias upst="upstream"
