#
#
#   Profile Pages
#
# ==========================================================
id() {
  args="$@"
  command="$1"
  shift
  rest="$@"

  if false; then echo false
  elif [ "$command" == "gh" ]; then
    id github "$rest"
  elif [ "$command" == "github" ]; then
    browser 'https://github.com/n4bb12' "$rest"
  elif [ "$command" == "gitlab" ]; then
    browser 'https://gitlab.com/n4bb12' "$rest"
  elif [ "$command" == "gl" ]; then
    id gitlab "$rest"
  else
    echo Unknown id "$args"
  fi
}
#
#
#   Google Search
#   https://www.lifewire.com/advanced-google-search-3482174
#
# ==========================================================
search() { browser 'https://www.google.de/search?q=' "$@"; }
alias s="search"
alias define="s define"
alias google="s"
alias stopwatch="s stopwatch"
alias timer="s timer"
alias watch="s watch"
alias weather="s weather"
#
#
#   Other Search
#
# ==========================================================
caniuse() { browser 'https://caniuse.com/#search=' "$@"; }
langs() { browser 'http://ionicabizau.github.io/github-profile-languages/?user=' "$@"; }
emoji() { browser 'http://emoji.muan.co/#' "$@"; }
alias emo="emoji"
flaticon() { browser 'https://www.flaticon.com/search?word=' "$@"; }
maps() { browser 'https://www.google.de/maps/search/' "$@"; }
#
#
#   Websites
#
# ==========================================================
contacts() { browser 'https://contacts.google.com' "$@"; }
dango() { browser 'https://getdango.com/interactive/?banner=0' "$@"; }
escape() { browser 'http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php' "$@"; }
github() { browser 'https://github.com/n4bb12' "$@"; }
gitlab() { browser 'https://gitlab.com/n4bb12' "$@"; }
mail() { browser 'https://mail.google.com' "$@"; }
music() { browser 'https://music.youtube.com' "$@"; }
youtube() { browser 'https://www.youtube.com' "$@"; }
#
#
#   References
#
# ==========================================================
reference() {
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
    https://airbnb.io/enzyme/docs/api/ "$rest"
  elif [ "$command" == "icons" ]; then
    browser 'https://material.io/tools/icons/?search=' "$rest"
  elif [ "$command" == "insect" ]; then
    browser 'https://github.com/sharkdp/insect#reference' "$rest"
  elif [ "$command" == "jest" ]; then
    https://jestjs.io/docs/en/getting-started "$rest"
  elif [ "$command" == "lodash" ]; then
    browser 'https://lodash.com/docs#' "$rest"
  elif [ "$command" == "ng" ]; then
    reference angular "$rest"
  elif [ "$command" == "node" ]; then
    browser 'https://nodejs.org/api/index.html' "$rest"
  elif [ "$command" == "npm" ]; then
    browser 'https://docs.npmjs.com/cli' "$rest"
  elif [ "$command" == "package" ]; then
    browser 'https://docs.npmjs.com/files/package.json#' "$rest"
  elif [ "$command" == "pkg" ]; then
    reference package "$rest"
  elif [ "$command" == "react" ]; then
    browser 'https://reactjs.org/docs/getting-started.html' "$rest"
  elif [ "$command" == "sc" ]; then
    reference styled "$rest"
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
  else
    search 'reference docs' "$args"
  fi
}
#
#
#   Tools
#
# ==========================================================
tool() {
  args="$@"
  command="$1"
  shift
  rest="$@"

  if false; then echo false
  elif [ "$command" == "angular" ]; then
    browser 'https://github.com/angular/angular-cli/wiki' "$rest"
  else
    search reference docs "$args"
  fi
}
alias ref="reference"
alias man="ref"
alias docs="ref"
#
#
#   Misc
#
# ==========================================================
insect() { browser 'https://insect.sh/?q=' "$@"; }
alias calc="insect"