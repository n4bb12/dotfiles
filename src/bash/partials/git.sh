#  
# 
#   Git Aliases
#   https://git-scm.com/docs
# 
# ==========================================================

require-binary 'git'

work() {
  git checkout -b $(echo "$1" | slug)
}

# Open the repository specified in package.json
repo() {
	if [ ! -d .git ]; then
			fail "ERR: You are not inside a git repository"
	fi

	url=$(git config --get remote.origin.url)
	url=$(echo $url | sed -e 's|:|/|g')
	url=$(echo $url | sed -e 's|git@|https://|g')
	url=$(echo $url | sed -e 's|.git$||g')

	branch=$(git rev-parse --abbrev-ref HEAD)

	opn $url/tree/$branch
}

alias       add='git add -A'
alias       eol='git rm --cached -r .'
alias       fix='git commit --fixup'
alias       log='git log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
alias      diff='git --no-pager diff'
alias      pull='git fetch --prune && git pull --ff'
alias      push='git push --follow-tags'
alias      show='git --no-pager show'
alias     amend='git commit --amend --no-edit'
alias     chmod='git update-index --chmod'
alias     diffs='git --no-pager diff --staged'
alias     fetch='git fetch --prune'
alias     ibase='git rebase -i origin/$(git rev-parse --abbrev-ref HEAD)'
alias     reset='git reset'
alias    branch='git rev-parse --abbrev-ref HEAD'
alias    cherry='git cherry-pick'
alias    commit='git commit'
alias    status='git --no-pager status'
alias  branches='git branch -a'
alias  checkout='git checkout'
alias  upstream='git branch --set-upstream-to origin/$(git rev-parse --abbrev-ref HEAD)'
alias add-white='git add -A && git diff --cached -w | git apply --cached -R'

alias   cm='commit -m'
alias   lg='log'
alias   pp='pull && push'
alias   st='status'
alias  bra='branches'
alias  out='checkout'
alias stat='status'
alias upst='upstream'
