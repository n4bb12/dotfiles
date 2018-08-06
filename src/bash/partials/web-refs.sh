#
#
#   References
#
# ==========================================================
ref() {
  args="$@"
  command="$1"
  shift
  rest="$@"

  if false; then echo false
  elif [ "$command" == "angular" ]; then
    browser 'https://github.com/angular/angular-cli/wiki' "$rest"
  elif [ "$command" == "cypress" ]; then
    browser 'https://docs.cypress.io' "$rest"
  elif [ "$command" == "enzyme" ]; then
    browser 'https://airbnb.io/enzyme/docs/api/' "$rest"
  elif [ "$command" == "git" ]; then
    browser 'https://git-scm.com/docs' "$rest"
  elif [ "$command" == "icons" ]; then
    browser 'https://material.io/tools/icons/?search=' "$rest"
  elif [ "$command" == "insect" ]; then
    browser 'https://github.com/sharkdp/insect#reference' "$rest"
  elif [ "$command" == "jest" ]; then
    browser 'https://jestjs.io/docs/en/getting-started' "$rest"
  elif [ "$command" == "lodash" ]; then
    browser 'https://lodash.com/docs#' "$rest"
  elif [ "$command" == "node" ]; then
    browser 'https://nodejs.org/api/index.html' "$rest"
  elif [ "$command" == "npm" ]; then
    browser 'https://docs.npmjs.com/cli' "$rest"
  elif [ "$command" == "package" ]; then
    browser 'https://docs.npmjs.com/files/package.json#' "$rest"
  elif [ "$command" == "react" ]; then
    browser 'https://reactjs.org/docs/getting-started.html' "$rest"
  elif [ "$command" == "selectors" ]; then
    browser 'https://www.w3schools.com/cssref/css_selectors.asp' "$rest"
  elif [ "$command" == "styled" ]; then
    browser 'https://www.styled-components.com/docs' "$rest"
  elif [ "$command" == "tsconfig" ]; then
    browser 'https://www.typescriptlang.org/docs/handbook/compiler-options.html' "$rest"
  elif [ "$command" == "tslint" ]; then
    browser 'https://palantir.github.io/tslint/rules' "$rest"
  elif [ "$command" == "types" ]; then
    browser 'https://microsoft.github.io/TypeSearch' "$rest"
  elif [ "$command" == "yarn" ]; then
    browser 'https://yarnpkg.com/en/docs/cli' "$rest"
  elif [ "$command" == "ng" ]; then
    ref angular "$rest"
  elif [ "$command" == "pkg" ]; then
    ref package "$rest"
  elif [ "$command" == "sc" ]; then
    ref styled "$rest"
  else
    search 'reference docs' "$args"
  fi
}
alias reference="ref"
alias man="reference"
alias docs="reference"