#  
# 
#   Chance Case
# 
#   Examples
#     $ echo 'Hello World!' | case param
#     hello-world
# 
#   https://github.com/blakeembrey/change-case#usage
# 
# ==========================================================

require-node-package 'change-case'

change-case() {
  input=$(cat -)
  module="$1"-case
  node-global -p "require(\"${module}\")(\"${input}\")"
}

alias case='change-case'

alias       no='case no'
alias      dot='case dot'
alias     path='case path'
alias     slug='case param'
alias     swap='case swap'
alias    camel='case camel'
alias    lower='case lower'
alias    param='case param'
alias    snake='case snake'
alias    title='case title'
alias    upper='case upper'
alias   header='case header'
alias   pascal='case pascal'
alias constant='case constant'
alias sentence='case sentence'
