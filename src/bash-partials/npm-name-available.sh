#  
# 
#   Find an Available NPM Package Name
# 
#   Examples
#     $ npm-name unicorn
#     Package name unicorn is already in use: https://www.npmjs.com/package/unicorn
# 
#     $ npm-name dualcorn
#     Package name dualcorn is available!
# 
#     $ available <name> [-r|--related][-o|--offline]
# 
#   https://github.com/nice-registry/all-the-package-names#usage
#   https://github.com/feross/available#usage
# 
# ==========================================================

require-node-package 'all-the-package-names'
require-node-package 'available'

function npm-name() {
  all-the-package-names | grep -E "^${1}$" > /dev/null
  status="$?"

  if [ "$status" -ne '0' ]; then
    echo -e Package name "${green}${1}${reset}" is available!
  else
    echo -e Package name "${red}${1}${reset}" is already in use: \
      "${cyan}https://www.npmjs.com/package/${1}${reset}"
  fi
}
