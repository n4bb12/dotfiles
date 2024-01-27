# bash completion
# https://www.cyberciti.biz/faq/add-bash-auto-completion-in-ubuntu-linux/
source /etc/profile.d/bash_completion.sh

# Preserve WSL path
# https://learn.microsoft.com/en-us/windows/terminal/tutorials/new-tab-same-directory#wsl
# PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\"
# "$(wslpath -w "$PWD")"'
PROMPT_COMMAND=${PROMPT_COMMAND:+"$PROMPT_COMMAND; "}'printf "\e]9;9;%s\e\\" "$(wslpath -w "$PWD")"'

alias reload="source ~/.profile"

