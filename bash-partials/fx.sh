#
#   Command-line JSON processing tool
#
#   Examples
#     $ curl https://jsonplaceholder.typicode.com/posts | fx 'this[0]'
#     $ cat package.json | fx .scripts
#
#   https://github.com/antonmedv/fx#usage
#
# ================================================

require-node-package 'fx'

# just install this for other tools that need it, we're not using it in aliases
require-node-package 'jq'

alias      scripts='cat package.json | fx .scripts'
alias         deps='cat package.json | fx .dependencies'
alias        ddeps='cat package.json | fx .devDependencies'
