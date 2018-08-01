#  
#   Simplified and community-driven man pages
# 
#   Examples
#     $ cat package.json | _ print --color
#     $ cat package.json | _ extract scripts
# 
#   https://github.com/ddopson/underscore-cli#documentation
# 
# ================================================

require-node-package "underscore-cli"

alias _="underscore"
alias pretty="_ print --color"
alias scripts="cat package.json | _ extract scripts | pretty"
