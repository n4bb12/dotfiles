# COMPLETION ===========================

# https://www.cyberciti.biz/faq/add-bash-auto-completion-in-ubuntu-linux/
if [[ -f /etc/profile.d/bash_completion.sh ]]; then
  source /etc/profile.d/bash_completion.sh
fi

# Copy global agent file (VS Code on Windows does not follow WSL symlinks)
SCRIPT_DIR=${SCRIPT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)}
agents_src="$SCRIPT_DIR/../config/~/.agents/AGENTS.md"
for prompts_dir in /mnt/c/Users/*/AppData/Roaming/{Code,Cursor}/User/prompts; do
  if [[ -d "$prompts_dir" && -f "$agents_src" ]]; then
    agents_dst="$prompts_dir/global.instructions.md"
    if [[ ! -f "$agents_dst" || "$agents_src" -nt "$agents_dst" ]]; then
      cp "$agents_src" "$agents_dst"
    fi
  fi
done

# PROMPT ===============================

# Preserve WSL path
# https://learn.microsoft.com/en-us/windows/terminal/tutorials/new-tab-same-directory#wsl
# PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\"
# "$(wslpath -w "$PWD")"'
PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\" "$(wslpath -w "$PWD")"'

set_title() {
  local DIR="${PWD}"
  # Check for match ignoring case (useful for Windows)
  if [[ "${DIR,,}" == "${HOME,,}"* ]]; then
    # Replace the prefix with ~
    DIR="~${DIR:${#HOME}}"
  fi
  echo -ne "\033]0;${DIR}\007"
}
PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}set_title
export PROMPT_COMMAND

# DISPLAY ==============================

# This fixes convex oauth login getting stuck in WSL. It will open the default browser in Windows instead of WSL.
export BROWSER=wslview

# vcxsrv
export DISPLAY=$(ip route | awk '/^default/{print $3}'):0.0
export XCURSOR_SIZE=64
export GDK_SCALE=0.67
export GDK_DPI_SCALE=1.5

# HOST =================================

alias clip='clip.exe'
alias explorer='explorer.exe'
alias copy='clip'
alias ex='explorer'

alias bat='batcat'
alias fd='fdfind'

alias f='code "$(fzf)"'
alias reload='source ~/.bashrc'
alias bashrc='code ~/.bashrc'

# DISK =================================

zerofill() {
  set -x
  sudo dd if=/dev/zero of=zero.fill bs=1M
  sudo rm zero.fill
  set +x

  echo "To optimize the VHDX file, run in PowerShell:"
  echo "wsl --shutdown"
  echo "wsl -l -v"
  echo "Optimize-VHD -Path "C:\wsl\Ubuntu\ext4.vhdx" -Mode Full"
}
