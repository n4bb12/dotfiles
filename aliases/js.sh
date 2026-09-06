# YARN =================================

alias yip='yarn install --production --ignore-scripts --prefer-offline'
alias yup='yarn upgrade'
alias yupi='yarn upgrade-interactive'
alias yupl='yarn upgrade --latest'
alias yupil='yarn upgrade-interactive --latest'

# BUN ==================================

alias bui="bun update --interactive"
alias fixbun='git checkout HEAD~1 -- bun.lock && bun i'
alias bunfix='fixbun'

# PACKAGE.JSON =========================

alias scripts='cat package.json | fx .scripts'
alias devdeps='cat package.json | fx .devDependencies'

alias ncuui='ncu -u -i --install never'
alias deps='ncuui'

free-name() {
  all-the-package-names | grep -E "^${1}$" >/dev/null
  status="$?"

  if [ "$status" -ne '0' ]; then
    echo -e Package name "${green}${1}${reset}" is available!
  else
    echo -e Package name "${red}${1}${reset}" is already in use: \
      "${cyan}https://www.npmjs.com/package/${1}${reset}"
  fi
}

# TYPESCRIPT ===========================

function fix-use-client() {
  bun run "$SCRIPT_DIR/../scripts/fix-use-client.ts" "$@"
  bun format
}
