source /usr/share/bash-completion/completions/git

git-workon() {
  local branch=$(echo "$@" | slug)

  if [ -z "$branch" ]; then
    echo 'No branch name given'
  elif git rev-parse --verify "$branch" >/dev/null 2>&1; then
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

git-back() {
  git reset HEAD~1
}

git-worktree-add() {
  local branch=$1
  local target="./worktrees/$branch"

  if [ -z "$branch" ]; then
    echo "ERR: No branch name given"
    return 1
  fi
  if [ -d "$target" ]; then
    echo "ERR: Target worktree already exists: $target"
    return 1
  fi

  if git show-ref --verify --quiet refs/heads/"$branch"; then
    git worktree add "$target" "$branch"
  else
    git worktree add -b "$branch" "$target"
  fi
  if [ $? -ne 0 ]; then
    echo "Failed to create worktree for branch '$branch'"
    return 1
  fi

  local env_files=(".env" ".env.local")

  for env_file in "${env_files[@]}"; do
    if [ -f "$env_file" ]; then
      if cp "$env_file" "$target/$env_file"; then
        echo "✅ $env_file copied"
      else
        echo "Failed to copy $env_file"
      fi
    fi
  done

  local ignore_line="worktrees/"
  if [ -f .gitignore ] && ! grep -q -F "$ignore_line" .gitignore; then
    if [ -n "$(tail -c1 .gitignore | tr -d '\n')" ]; then
      echo >>.gitignore
    fi
    echo "$ignore_line" >>.gitignore
    echo "✅ Added $ignore_line to .gitignore"
  fi

  (cd "$target" && bun install)

  echo "🚀 Worktree ready at $target"
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

# Aliases
alias fetch='git fetch --prune'

alias bra='git branch -a'

alias wt='git worktree'
alias wta='git-worktree-add'
alias wtl='git worktree prune && git worktree list'
alias wtp='git worktree prune && git worktree list'
alias wtr='git worktree remove'

alias checkout='git checkout'

alias clean='git clean -df'
alias cleanx='git clean -dfx'
alias cleani='git clean -dfxi'
alias eol='git rm --cached -r .'

alias reset='git reset'
alias resetf='git reset --hard'
alias freset='resetf'

alias lg='git-lg'
alias lga='git-lga'

alias cherry='git cherry-pick'
alias pick='git cherry-pick'

alias status='git --no-pager status'
alias st='status'
alias sts='status --short'

alias diff='git --no-pager diff'
alias diffs='diff --staged'
alias diffns='diff --name-status'
alias difft='diff --stat'

alias stash='git stash --all'
alias pop='git stash pop'

alias add='git add -A'

alias amend='git commit --amend --no-edit --no-verify'
alias empty='git commit -m "Trigger CI" --allow-empty'
alias fix='git commit --no-verify --fixup'
alias squash='git commit --squash'

alias show='git --no-pager show'
alias showns='git --no-pager show --name-status'

alias push='git push --follow-tags --no-verify'
alias pushf='push --force-with-lease'

alias bisect='git bisect'
alias reflog='git ref'
alias revert='git revert'
alias tag='git tag'

alias cz='git cz'
alias blame="git blame -w -C -C -C --date relative --color-lines --color-by-age"
alias git-mod='git update-index --chmod'

# Shorthands
alias back='git-back'
alias ch='git-checkout'
alias cm='git-commit'
alias cmc='git-commit-copilot'
alias cont='git-continue'
alias fpush='pushf'
alias pfusch='pushf'
alias pfush='pushf'
alias upst='git-set-upstream'

# Combos
alias add-white='git add -A && git diff --cached -w | git apply --cached -R'
alias cfrf='cleanf && resetf'
alias ibase='fetch && git-rebase-interactive'
alias pp='pull && push'
alias unmerged='git diff --name-only --diff-filter U | xargs code'
