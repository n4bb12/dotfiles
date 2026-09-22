# KDE Plasma / Kubuntu

SCRIPT_DIR=${SCRIPT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)}
KUBUNTU_BIN="$(cd -- "$SCRIPT_DIR/../install/kubuntu" && pwd)"

case ":$PATH:" in
  *":$KUBUNTU_BIN:"*) ;;
  *) export PATH="$KUBUNTU_BIN:$PATH" ;;
esac

# Campbell maps ANSI blue (34) to #0037DA, which disappears on black.
# Bright blue (94, #3B78FF) stays readable. Consumed by powerline.sh.
COLOR_CWD='\[\033[0;94m\]'
