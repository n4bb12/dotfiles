#
#
#   Yarn Alises
#   https://yarnpkg.com/lang/en/docs/cli/
#
# ================================================

# It's difficult to make this work properly.
# Better install manually from
# https://yarnpkg.com/en/docs/install
#
# require-node-module 'yarn'

require-binary 'node'
require-binary 'npm'
require-binary 'yarn'
require-binary 'pnpm'
require-node-module 'npm-check-updates'
require-node-module 'nx'

alias y='yarn'
alias ya='yarn add'
alias yg='yarn global'
alias yr='yarn remove'
alias yad='yarn add --dev'
alias yga='yarn global add'
alias ygr='yarn global remove'
alias yip='yarn install --production --ignore-scripts --prefer-offline'
alias yup='yarn upgrade'
alias yupi='yarn upgrade-interactive'
alias yupl='yarn upgrade --latest'
alias yupil='yarn upgrade-interactive --latest'
