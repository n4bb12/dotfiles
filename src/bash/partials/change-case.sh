#  
# 
#   Chance Case
# 
#   Examples
#     $ echo "Hello World!" | case param
#     hello-world
# 
#   https://github.com/blakeembrey/change-case#usage
# 
# ==========================================================

require-node-package "change-case"

change-case() {
  input=$(cat -)
  module="$1-case"
  node-global -p "require(\"${module}\")(\"${input}\")"
}

alias case="change-case"

alias camel="case camel"
alias constant="case constant"
alias dot="case dot"
alias header="case header"
alias lower="case lower"
alias no="case no"
alias param="case param"
alias pascal="case pascal"
alias path="case path"
alias sentence="case sentence"
alias snake="case snake"
alias swap="case swap"
alias title="case title"
alias upper="case upper"
alias slug="case param"
