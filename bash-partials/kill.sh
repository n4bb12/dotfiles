#
#
#   Kill processes
#
#   Examples
#     $ kill 1337
#     $ kill chrome
#     $ kill :8080
#     $ kill 1337 chrome :8080
#     $ kill
#
#   https://github.com/sindresorhus/fkill-cli#usage
#
# ==========================================================

require-node-module 'fkill-cli'

alias         kill='fkill --force'
