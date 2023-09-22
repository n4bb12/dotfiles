#
#
#   Git Aliases
#   https://git-scm.com/docs
#
# ==========================================================

require-binary 'git'
require-node-module 'commitizen'
require-node-module 'cz-conventional-changelog'

echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

git-work() {
  branch=$(echo "$@" | slug)
  if git rev-parse --verify "$branch" > /dev/null 2>&1; then
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

git-branch() {
  git rev-parse --abbrev-ref HEAD
}

git-default-branch() {
  git remote show origin | grep "HEAD branch" | cut -d ":" -f 2 | xargs
}

git-set-upstream() {
  git branch --set-upstream-to "origin/$(git-branch)"
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

  open-cli "$url/tree/$(git-branch)"
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

git-redate() {
  LC_ALL=C GIT_COMMITTER_DATE="$(date)" git commit --amend --no-edit --reset-author --date "$(date)"
}

git-pending() {
  echo "rebase"
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

# Aliases
alias           cm='git-commit'
alias           cz="git cz"
alias          add='git add -A'
alias          eol='git rm --cached -r .'
alias          fix='git commit --no-verify --fixup'
alias          wip='git-wip'
alias         diff='git --no-pager diff'
alias         push='git push --follow-tags --no-verify'
alias         show='git --no-pager show'
alias         skip='git-skip'
alias        abort='git-abort'
alias        amend='git commit --amend --no-edit --no-verify'
alias        clean='git clean'
alias        empty='git commit -m "Trigger CI" --allow-empty'
alias        fetch='git fetch --prune'
alias        reset='git reset'
alias        stash='git stash'
alias       cherry='git cherry-pick'
alias       commit='git commit'
alias       reflog='git reflog --date=relative'
alias       status='git --no-pager status'
alias      git-mod='git update-index --chmod'
alias      log-all='git log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
alias     branches='git branch -a'
alias     checkout='git checkout'
alias     continue='git-continue'
alias     unmerged='git diff --name-only --diff-filter U | xargs code'

# Transitive Aliases
alias           lg='log'
alias           st='status'
alias          bra='branches'
alias          lga='log-all'
alias          log='log-all -20'
alias          out='checkout'
alias         cont='continue'
alias         pick='cherry'
alias         pull='git-pull'
alias         repo='git-repo'
alias         stat='status'
alias         upst='git-set-upstream'
alias         work='git-work'
alias        check='checkout'
alias        diffs='diff --staged'
alias        fpush='push --force-with-lease'
alias        ibase='fetch && git-rebase-interactive'
alias        merge='git-merge'
alias        pfush='fpush'
alias       branch='git-branch'
alias       pfusch='fpush'
alias       rebase='git-rebase'

# Combos
alias           pp='pull && push'
alias      noclone='git reset --hard && git clean -xdf'
alias    add-white='git add -A && git diff --cached -w | git apply --cached -R'
