#  
# 
#   Bash Colors
# 
#   https://misc.flogisoft.com/bash/tip_colors_and_formatting
# 
# ==========================================================

  black="\e[30m"
    red="\e[31m"
  green="\e[32m"
 yellow="\e[33m"
   blue="\e[34m"
magenta="\e[35m"
   cyan="\e[36m"
   gray="\e[37m"
  reset="\e[39m"

fail() {
  echo -e "${red}${@}${reset}"
  return 1
}

warn() {
  echo -e "${yellow}${@}${reset}"
}

alias cl="clear"
