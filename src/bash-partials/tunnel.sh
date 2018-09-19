#
#   Tunnel the local app to a public URL.
#
#   Note: It may be neccessary to explicitly allow
#   connections from outside localhost, see
#   https://help.crossbrowsertesting.com/faqs/testing/invalid-host-header-error/
#
#   Examples
#     $ tunnel 4200
#
#   https://localtunnel.github.io/www/
#
# ================================================

require-node-package 'localtunnel'

alias       tunnel='lt --print-requests --open --port'
