#
#
#   Chance Case
#
#   Examples
#     $ echo 'Hello World!' | change-case param
#     hello-world
#
#   https://github.com/blakeembrey/change-case#usage
#
# ==========================================================

require-node-package 'change-case'

function change-case() {
  input=$(cat -)
  module="$1"-case
  node-global -p "require(\"${module}\")(\"${input}\")"
}

alias           no='change-case no'
alias          dot='change-case dot'
alias         path='change-case path'
alias         slug='change-case param'
alias         swap='change-case swap'
alias        camel='change-case camel'
alias        lower='change-case lower'
alias        param='change-case param'
alias        snake='change-case snake'
alias        title='change-case title'
alias        upper='change-case upper'
alias       header='change-case header'
alias       pascal='change-case pascal'
alias     constant='change-case constant'
alias     sentence='change-case sentence'
