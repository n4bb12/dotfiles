#
#
#   Git Aliases
#   https://git-scm.com/docs
#
# ==========================================================

require-binary 'git'

git-work() {
  branch=$(echo "$@" | slug)
  if git rev-parse --verify "$branch" > /dev/null 2>&1; then
    git checkout "$branch"
  else
    git checkout -b "$branch"
  fi
  code .
}

git-branch() {
  git rev-parse --abbrev-ref HEAD
}

git-upstream() {
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
  url=$(echo $url | sed -e 's|.git$||g')

  opn $url/tree/$(git-branch)
}

git-pull() {
  git fetch --prune
  git branch --set-upstream-to origin/$(git-branch)
  git pull
}

alias          add='git add -A'
alias          eol='git rm --cached -r .'
alias          fix='git commit --fixup'
alias          log='log-all -16'
alias         diff='git --no-pager diff'
alias         push='git push --follow-tags'
alias         show='git --no-pager show'
alias        amend='git commit --amend --no-edit'
alias        diffs='git --no-pager diff --staged'
alias        fetch='git fetch --prune'
alias        ibase='git rebase -i origin/$(git-branch)'
alias        reset='git reset'
alias       cherry='git cherry-pick'
alias       commit='git commit'
alias       gitmod='git update-index --chmod'
alias       status='git --no-pager status'
alias      log-all='git log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'
alias      noclone='git reset --hard && git clean -xdf'
alias     branches='git branch -a'
alias     checkout='git checkout'
alias    add-white='git add -A && git diff --cached -w | git apply --cached -R'

alias           cm='git commit -m'
alias           lg='log'
alias           pp='pull && push'
alias           st='status'
alias          bra='branches'
alias          lga='log'
alias          out='checkout'
alias         pick='cherry'
alias         pull='git-pull'
alias         repo='git-repo'
alias         stat='status'
alias         upst='upstream'
alias         work='git-work'
alias       branch='git-branch'
alias     upstream='git-upstream'
