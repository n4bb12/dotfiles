source /usr/share/bash-completion/completions/git

git-workon() {
  local branch=$(echo "$@" | slug)

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

  local url=$(git-origin)
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

git-commit-copilot() {
  local msg=$(bun run "$SCRIPT_DIR/git-commit-ai.ts" "$@")
  local ret=$?

  if [ $ret -ne 0 ]; then
    return $ret
  fi

  if [ -z "$msg" ]; then
    # errors are logged in the script
    return 1
  fi

  git commit -m "$msg" "$@"
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

git-reauthor() {
  git commit --amend --no-edit --reset-author
}

git-reauthor-all() {
  git rebase -r --root --exec "git commit --amend --no-edit --reset-author"
}

git-switch() {
	local user="$1"

  git maintenance start
  git config --global user.name 'Abraham Schilling'
  git config --global user.email '6810177+n4bb12@users.noreply.github.com'

  case $user in
    default)
      git config user.email '6810177+n4bb12@users.noreply.github.com'
      ;;
    crossload)
      git config user.email '39-n4bb12@users.noreply.gitlab.crossload.org'
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
alias commit='git-commit'
alias commit='git-commit-copilot'
alias continue='git-continue'
alias merge='git-merge'
alias pull='git-pull'
alias rebase='git-rebase'
alias repo='git-repo'
alias skip='git-skip'
alias switch='git-switch'
alias set-upstream='git-set-upstream'
alias wip='git-wip'
alias workon='git-workon'
__git_complete commit _git_commit
__git_complete merge _git_merge
__git_complete pull _git_pull
__git_complete rebase _git_rebase

# Aliases
alias fetch='git fetch --prune'
__git_complete fetch _git_fetch

alias bra='git branch -a'
__git_complete bra _git_branch

alias checkout='git checkout'
__git_complete checkout _git_checkout

alias clean='git clean -df'
alias cleanx='git clean -dfx'
alias cleani='git clean -dfxi'
alias eol='git rm --cached -r .'
__git_complete clean _git_clean
__git_complete cleanx _git_clean
__git_complete cleani _git_clean
__git_complete eol _git_rm

alias reset='git reset'
alias resetf='git reset --hard'
alias freset='resetf'
__git_complete reset _git_reset
__git_complete resetf _git_reset
__git_complete freset _git_reset

alias lg='git-lg'
alias lga='git-lga'
__git_complete lg _git_log
__git_complete lga _git_log

alias cherry='git cherry-pick'
alias pick='git cherry-pick'
__git_complete cherry _git_cherry_pick
__git_complete pick _git_cherry_pick

alias status='git --no-pager status'
alias st='status'
__git_complete status _git_status
__git_complete st _git_status

alias diff='git --no-pager diff'
alias diffs='diff --staged'
alias diffns='diff --name-status'
alias difft='diff --stat'
__git_complete diff _git_diff
__git_complete diffs _git_diff
__git_complete diffns _git_diff
__git_complete difft _git_diff

alias stash='git stash --all'
alias pop='git stash pop'
__git_complete stash _git_stash
__git_complete pop _git_stash

alias add='git add -A'
__git_complete add _git_add

alias amend='git commit --amend --no-edit --no-verify'
alias empty='git commit -m "Trigger CI" --allow-empty'
alias fix='git commit --no-verify --fixup'
alias squash='git commit --squash'
__git_complete amend _git_commit
__git_complete empty _git_commit
__git_complete fix _git_commit
__git_complete squash _git_commit

alias show='git --no-pager show'
alias showns='git --no-pager show --name-status'
__git_complete show _git_show
__git_complete showns _git_show

alias push='git push --follow-tags --no-verify'
alias pushf='push --force-with-lease'
__git_complete push _git_push
__git_complete pushf _git_push

alias bisect='git bisect'
alias reflog='git ref'
alias revert='git revert'
alias tag='git tag'
__git_complete bisect _git_bisect
__git_complete reflog _git_reflog
__git_complete revert _git_revert
__git_complete tag _git_tag

alias cz='git cz'
alias blame="git blame -w -C -C -C --date relative --color-lines --color-by-age"
alias git-mod='git update-index --chmod'

# Shorthands
alias ch='checkout'
alias cm='git-commit'
alias cmc='git-commit-copilot'
alias cont='continue'
alias fpush='pushf'
alias pfusch='pushf'
alias pfush='pushf'
alias upst='set-upstream'
__git_complete ch _git_checkout
__git_complete cm _git_commit
__git_complete fpush _git_push
__git_complete pfusch _git_push
__git_complete pfush _git_push

# Combos
alias add-white='git add -A && git diff --cached -w | git apply --cached -R'
alias cfrf='cleanf && resetf'
alias ibase='fetch && git-rebase-interactive'
alias pp='pull && push'
alias unmerged='git diff --name-only --diff-filter U | xargs code'
