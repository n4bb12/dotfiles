#
#
#   Open Windows Explorer
#
#   Examples
#     $ ex .
#     $ ex ,
#     $ ex /
#     $ ex ~
#     $ ex $(yarn global dir)
#
#   https://ss64.com/nt/explorer.html
#
# ==========================================================

#
# MacOS has Finder (open .)
# Linux has Nautilus (nautilus .)
#

#
# Open an Explorer window at $1 (defaults to .)
# ex <path>
#
# Open an Explorer window at the 'Computer'
# ex ,
#
# Open an Explorer window at 'My Documents'
# ex /
#
ex() {
  path=${1:-.}
  explorer $path
}
