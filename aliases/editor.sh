# EDITOR ===============================

SCRIPT_DIR=${SCRIPT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)}
DOTFILES_BIN="$(cd -- "$SCRIPT_DIR/.." && pwd)/bin"

# Git, npm, and other subprocesses exec `code` from PATH.
# They never see the `code=cursor` alias, so keep a real shim on PATH.
case ":$PATH:" in
  *":$DOTFILES_BIN:"*) ;;
  *) export PATH="$DOTFILES_BIN:$PATH" ;;
esac

VSCODE_BIN=""
while IFS= read -r candidate; do
  [ "$candidate" = "$DOTFILES_BIN/code" ] && continue
  VSCODE_BIN="$candidate"
  break
done < <(type -ap code 2>/dev/null)

vscode() {
  "$VSCODE_BIN" "$@"
}

alias code=cursor
alias codei=code-insiders
alias idea=idea64

export EDITOR="code --wait --reuse-window"
export GIT_SEQUENCE_EDITOR="$EDITOR"
export SEQUENCE_EDITOR="$EDITOR"
