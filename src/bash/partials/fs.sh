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

alias   ~="cd ~"
alias  ..="cd .."
alias ...="cd ../.."

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

alias l="ls"
alias ll="l -lah"

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