# bash completion
# https://www.cyberciti.biz/faq/add-bash-auto-completion-in-ubuntu-linux/
source /etc/profile.d/bash_completion.sh
source /usr/share/bash-completion/completions/git

# Preserve WSL path
# https://learn.microsoft.com/en-us/windows/terminal/tutorials/new-tab-same-directory#wsl
# PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\"
# "$(wslpath -w "$PWD")"'
PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\" "$(wslpath -w "$PWD")"'

# vcxsrv
export DISPLAY=$(ip route | awk '/^default/{print $3}'):0.0
export XCURSOR_SIZE=64
export GDK_SCALE=0.67
export GDK_DPI_SCALE=1.5

# host binaries
alias clip='clip.exe'
alias explorer='explorer.exe'

# aliases
alias bat='batcat'
alias copy='clip'
alias ex='explorer'
alias fd='fdfind'

# commands
alias f='code "$(fzf)"'
alias reload='source ~/.profile'
