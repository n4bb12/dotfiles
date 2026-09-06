# EDITOR ===============================

VSCODE_BIN="$(command -v code)"

vscode() {
  "$VSCODE_BIN" "$@"
}

alias code=cursor
alias codei=code-insiders
alias idea=idea64

export EDITOR="code --wait --reuse-window"
export GIT_SEQUENCE_EDITOR="$EDITOR"
export SEQUENCE_EDITOR="$EDITOR"
