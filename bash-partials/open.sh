#
#
#   Open With System Default Program
#
#   Examples
#     $ open carbon.png
#     $ open example.com
#     $ open README.md
#
#   https://github.com/sindresorhus/open-cli#usage
#
# ==========================================================

require-node-package 'open-cli'

if ! command -v open > /dev/null 2>&1; then
  alias       open='open-cli'
fi
