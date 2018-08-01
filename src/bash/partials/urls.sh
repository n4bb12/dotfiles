#
#
#   Google Search
#   https://www.lifewire.com/advanced-google-search-3482174
#
# ==========================================================
search() { browser 'https://www.google.de/search?q=' "$@"; }
alias s="search"
alias calc="s"
alias define="s define"
alias google="s"
alias stopwatch="s stopwatch"
alias timer="s timer"
alias watch="s watch"
alias weather="s weather"
#
#
#   Websites
#
# ==========================================================
caniuse() { browser 'https://caniuse.com/#search=' "$@"; }
dango() { browser 'https://getdango.com/interactive/?banner=0' "$@"; }
emoji() { browser 'http://emoji.muan.co/#' "$@"; }
alias emo="emoji"
escape() { browser 'http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php' "$@"; }
flaticon() { browser 'https://www.flaticon.com/search?word=' "$@"; }
github() { browser 'https://github.com/n4bb12/' "$@"; }
gitlab() { browser 'https://gitlab.com/n4bb12/' "$@"; }
maps() { browser 'https://www.google.de/maps/search/' "$@"; }
music() { browser 'https://music.youtube.com/' "$@"; }
youtube() { browser 'https://www.youtube.com/' "$@"; }
alias yt="youtube"
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
    browser 'https://github.com/angular/angular-cli/wiki/' "$rest"
  elif [ "$command" == "cypress" ]; then
    browser 'https://yarnpkg.com/en/docs/cli/' "$rest"
  elif [ "$command" == "icons" ]; then
    browser 'https://material.io/tools/icons/?search=' "$rest"
  elif [ "$command" == "lodash" ]; then
    browser 'https://lodash.com/docs#' "$rest"
  elif [ "$command" == "ng" ]; then
    browser 'https://github.com/angular/angular-cli/wiki/' "$rest"
  elif [ "$command" == "node" ]; then
    browser 'https://nodejs.org/api/index.html' "$rest"
  elif [ "$command" == "npm" ]; then
    browser 'https://docs.npmjs.com/cli/' "$rest"
  elif [ "$command" == "package" ]; then
    browser 'https://docs.npmjs.com/files/package.json#' "$rest"
  elif [ "$command" == "pkg" ]; then
    browser 'https://docs.npmjs.com/files/package.json#' "$rest"
  elif [ "$command" == "selectors" ]; then
    browser 'https://www.w3schools.com/cssref/css_selectors.asp' "$rest"
  elif [ "$command" == "types" ]; then
    browser 'https://microsoft.github.io/TypeSearch' "$rest"
  elif [ "$command" == "yarn" ]; then
    browser 'https://yarnpkg.com/en/docs/cli/' "$rest"
  else
    search reference docs "$args"
  fi
}
alias ref="reference"
alias man="ref"
alias docs="ref"