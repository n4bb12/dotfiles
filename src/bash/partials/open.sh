#  
# 
#   Open With System Default Program
# 
#   Examples
#     $ opn carbon.png
#     $ opn example.com
#     $ opn README.md
# 
#   https://github.com/sindresorhus/opn-cli#usage
# 
# ==========================================================

require-node-package "opn-cli"

if ! command -v open > /dev/null 2>&1; then
  alias open="opn"
fi
