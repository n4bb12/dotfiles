#
#
#   Git Aliases
#   https://git-scm.com/docs
#
# ==========================================================

require-binary 'git'
require-node-package 'commitizen'
require-node-package 'cz-conventional-changelog'

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
  git remote show origin | grep "HEAD branch" | cut -d ":" -f 2
}

git-set-upstream() {
  git branch --set-upstream-to origin/$(git-branch)
}

git-repo() {
  if [ ! -d .git ]; then
    fail 'ERR: You are not inside a git repository'
    return 1
  fi

  url=$(git config --get remote.origin.url)
  url=$(echo $url | sed -e 's|:|/|g')
  url=$(echo $url | sed -e 's|git@|https://|g')
  url=$(echo $url | sed -e 's|https///|https://|g')
  url=$(echo $url | sed -e 's|.git$||g')
  url=$(echo $url | sed -e 's|.git/$||g')

  opn $url/tree/$(git-branch)
}

git-pull() {
  git fetch --prune
  git branch --set-upstream-to origin/$(git-branch)
  git pull
}

git-rebase() {
  if [ ! -z $1 ]; then
    git rebase $1
  else
    git rebase origin/$(git-default-branch)
  fi
}

git-rebase-interactive() {
  if [ ! -z $1 ]; then
    git rebase -i --autosquash $1
  else
    git rebase -i --autosquash origin/$(git-default-branch)
  fi
}

# Aliases
alias           cm='git commit -m'
alias           cz="git cz"
alias          add='git add -A'
alias          eol='git rm --cached -r .'
alias          fix='git commit --fixup'
alias          wip='git-wip'
alias         diff='git --no-pager diff'
alias         push='git push --follow-tags --no-verify'
alias         show='git --no-pager show'
alias        amend='git commit --amend --no-edit --no-verify'
alias        clean='git clean'
alias        fetch='git fetch --prune'
alias        reset='git reset'
alias       cherry='git cherry-pick'
alias       commit='git commit'
alias       reflog='git reflog'
alias       status='git --no-pager status'
alias      git-mod='git update-index --chmod'
alias      log-all='git log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
alias     branches='git branch -a'
alias     checkout='git checkout'

# Transitive Aliases
alias           lg='log'
alias           st='status'
alias          bra='branches'
alias          lga='log-all'
alias          log='log-all -20'
alias          out='checkout'
alias         pick='cherry'
alias         pull='git-pull'
alias         repo='git-repo'
alias         stat='status'
alias         upst='git-set-upstream'
alias         work='git-work'
alias        diffs='diff --staged'
alias        fpush='push --force-with-lease'
alias        ibase='git-rebase-interactive'
alias        pfush='fpush'
alias       branch='git-branch'
alias       pfusch='fpush'
alias       rebase='git-rebase'

# Combos
alias           pp='pull && push'
alias      noclone='git reset --hard && git clean -xdf'
alias    add-white='git add -A && git diff --cached -w | git apply --cached -R'
