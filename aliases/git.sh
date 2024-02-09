git-workon() {
  branch=$(echo "$@" | slug)

	if [ -z "$branch" ]; then
		echo 'No branch name given'
  elif git rev-parse --verify "$branch" > /dev/null 2>&1; then
    git checkout "$branch"
  else
    git checkout -b "$branch"
  fi

  code .
}

git-wip() {
  git add -A
  git status
  git commit -m wip --no-verify
}

git-current-branch() {
  git rev-parse --abbrev-ref HEAD
}

git-default-branch() {
  git remote show origin | grep 'HEAD branch' | cut -d ":" -f 2 | xargs
}

git-set-upstream() {
  git branch --set-upstream-to "origin/$(git-current-branch)"
}

git-origin() {
  git config --get remote.origin.url
}

git-repo() {
  if [ ! -d .git ]; then
    fail 'ERR: You are not inside a git repository'
    return 1
  fi

  url=$(git-origin)
  url=$(echo $url | sed -e 's|:|/|g')
  url=$(echo $url | sed -e 's|git@|https://|g')
  url=$(echo $url | sed -e 's|https///|https://|g')
  url=$(echo $url | sed -e 's|.git$||g')
  url=$(echo $url | sed -e 's|.git/$||g')

  open-cli "$url/tree/$(git-current-branch)"
}

git-pull() {
  git fetch --prune
  git-set-upstream
  git pull
}

git-commit() {
  if [ $# -eq 0 ]; then
    git commit
  else
    git commit -m "$@"
  fi
}

git-merge() {
  if [ ! -z $1 ]; then
    git merge $1
  else
    git merge "origin/$(git-default-branch)"
  fi
}

git-rebase() {
  if [ ! -z $1 ]; then
    git rebase $1
  else
    git rebase "origin/$(git-default-branch)"
  fi
}

git-rebase-interactive() {
  if [ ! -z $1 ]; then
    git rebase -i --autosquash $1
  else
    git rebase -i --autosquash "origin/$(git-default-branch)"
  fi
}

# determine whether we're rebasing or merging or cherry-picking, etc.
git-pending() {
	if [ -d "$(git rev-parse --git-path rebase-merge)" ]; then
		echo rebase
	elif [ -d "$(git rev-parse --git-path rebase-apply)" ]; then
		echo rebase
	elif [ -f "$(git rev-parse --git-path MERGE_HEAD)" ]; then
		echo merge
	elif [ -f "$(git rev-parse --git-path CHERRY_PICK_HEAD)" ]; then
		echo cherry-pick
	elif [ -f "$(git rev-parse --git-path REVERT_HEAD)" ]; then
		echo revert
	fi
}

git-continue() {
  git $(git-pending) --continue
}

git-abort() {
  git $(git-pending) --abort
}

git-skip() {
  git $(git-pending) --skip
}

git-redate() {
  LC_ALL=C GIT_COMMITTER_DATE="$(date)" git commit --amend --no-edit --reset-author --date "$(date)"
}

git-switch() {
	user="$1"

  git config --unset-all user.name
  git config --unset-all user.email
  git config --global user.name 'Abraham Schilling'

  case $user in
    senacor)
      git config user.email 'abraham.schilling@senacor.com'
      ;;
    elvent)
      git config user.email 'abraham@elvent.de'
      ;;
    n4bb12|default)
      git config user.email 'AbrahamSchilling@gmail.com'
      ;;
    *)
    	echo -e "Unknown git user: ${red}${user}${reset}"
      return
      ;;
  esac

  echo "$(git config user.name) <$(git config user.email)>"
}

git-lg() {
  git lg -20 "$@"
  echo
}

git-lga() {
  git lg "$@"
  echo
}

# Functions
alias abort='git-abort'
alias branch='git-current-branch'
alias cm='git-commit'
alias continue='git-continue'
alias merge='git-merge'
alias pull='git-pull'
alias rebase='git-rebase'
alias repo='git-repo'
alias skip='git-skip'
alias switch='git-switch'
alias upst='git-set-upstream'
alias wip='git-wip'
alias workon='git-workon'

# Aliases
alias fetch='git fetch --prune'

alias branches='git branch -a'
alias bra='git branch -a'

alias checkout='git checkout'
alias ch='git checkout'

alias clean='git clean'
alias cleanf='git clean -dfx'
alias fclean='cleanf'
alias eol='git rm --cached -r .'

alias reset='git reset'
alias resetf='git reset --hard'
alias freset='resetf'

alias lg='git-lg'
alias lga='git-lga'

alias cherry='git cherry-pick'
alias pick='git cherry-pick'

alias status='git --no-pager status'
alias stat='status'
alias st='status'

alias diff='git --no-pager diff'
alias diffs='diff --staged'
alias unmerged='git diff --name-only --diff-filter U | xargs code'

alias stash='git stash'
alias pop='git stash pop'

alias add='git add -A'
alias git-mod='git update-index --chmod'

alias cz='git cz'
alias commit='git commit'
alias amend='git commit --amend --no-edit --no-verify'
alias empty='git commit -m "Trigger CI" --allow-empty'
alias fix='git commit --no-verify --fixup'
alias squash='git commit --squash'

alias show='git --no-pager show'
alias showns='git --no-pager show --name-status'

alias push='git push --follow-tags --no-verify'
alias pushf='push --force-with-lease'
alias fpush='pushf'
alias pfush='pushf'
alias pfusch='pushf'

alias bisect='git bisect'
alias cont='continue'
alias reflog='git ref'
alias revert='git revert'
alias tag='git tag'

# Combos
alias add-white='git add -A && git diff --cached -w | git apply --cached -R'
alias ibase='fetch && git-rebase-interactive'
alias cfrf='cleanf && resetf'
alias pp='pull && push'
