#  
# 
#   npm
#   https://docs.npmjs.com/misc/config
# 
# ================================================

require-binary "npm"
require-node-package "philemon"

alias npm="philemon npm"

npm config set color always
npm config set editor code
npm config set git-tag-version false
npm config set init.author.email "AbrahamSchilling@gmail.com"
npm config set init.author.name "Abraham Schilling"
npm config set progress false
npm config set shell bash
