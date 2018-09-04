#
#
#   Change Directory
#
#   Examples
#     $ ~
#     $ ..
#     $ ...
#
#   http://linuxcommand.org/lc3_man_pages/cdh.html
#
# ==========================================================

alias   ~='cd ~'
alias  ..='cd ..'
alias  ..1='cd ..'
alias  ..2='cd ../..'
alias  ..3='cd ../../..'
alias  ..4='cd ../../../..'
alias  ..5='cd ../../../../..'

# Create a new directory and enter it
function mkd() {
  mkdir -p "$@" && cd "$_";
}

#
#
#   List Files
#
#   Examples
#     $ l
#     $ ll
#
#   http://man7.org/linux/man-pages/man1/ls.1.html
#
# ==========================================================

alias   l='ls'
alias  ll='ls -lah'
alias lll='ls -lah' # in case of too many 'l's when typing 'll'

#
#
#   File Size
#
# ================================================

# Determine size of a file or total size of a directory
function fs() {
  if du -b /dev/null > /dev/null 2>&1; then
    local arg=-sbh;
  else
    local arg=-sh;
  fi
  if [[ -n "$@" ]]; then
    du $arg -- "$@";
  else
    du $arg .[^.]* ./*;
  fi;
}
