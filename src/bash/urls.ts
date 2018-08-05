import { BashScript } from "./BashScript"

generateUrls()

function generateUrls() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("Profile Pages")

  script.switch("id", "echo Unknown id", {
    gh: "id github",
    github: "browser 'https://github.com/n4bb12'",
    gitlab: "browser 'https://gitlab.com/n4bb12'",
    gl: "id gitlab",
  })

  section("Google Search",
  "https://www.lifewire.com/advanced-google-search-3482174")
  browse("search", "https://www.google.de/search?q=")
  const search = alias("s", "search")

  alias("define", search("define"))
  alias("google", search())
  alias("stopwatch", search("stopwatch"))
  alias("timer", search("timer"))
  alias("watch", search("watch"))
  alias("weather", search("weather"))

  section("Other Search")

  browse("caniuse", "https://caniuse.com/#search=")
  browse("langs", "http://ionicabizau.github.io/github-profile-languages/?user=")
  browse("emoji", "http://emoji.muan.co/#").alias("emo")
  browse("flaticon", "https://www.flaticon.com/search?word=")
  browse("maps", "https://www.google.de/maps/search/")

  section("Websites")

  browse("contacts", "https://contacts.google.com")
  browse("dango", "https://getdango.com/interactive/?banner=0")
  browse("escape", "http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php")
  browse("github", "https://github.com/n4bb12")
  browse("gitlab", "https://gitlab.com/n4bb12")
  browse("mail", "https://mail.google.com")
  browse("music", "https://music.youtube.com")
  browse("youtube", "https://www.youtube.com")

  section("References")

  script.switch("reference", "search 'reference docs'", {
    angular:   "browser 'https://github.com/angular/angular-cli/wiki'",
    cypress:   "browser 'https://docs.cypress.io'",
    enzyme:    "https://airbnb.io/enzyme/docs/api/",
    icons:     "browser 'https://material.io/tools/icons/?search='",
    insect:    "browser 'https://github.com/sharkdp/insect#reference'",
    jest:      "https://jestjs.io/docs/en/getting-started",
    lodash:    "browser 'https://lodash.com/docs#'",
    ng:        "reference angular",
    node:      "browser 'https://nodejs.org/api/index.html'",
    npm:       "browser 'https://docs.npmjs.com/cli'",
    package:   "browser 'https://docs.npmjs.com/files/package.json#'",
    pkg:       "reference package",
    react:     "browser 'https://reactjs.org/docs/getting-started.html'",
    sc:        "reference styled",
    selectors: "browser 'https://www.w3schools.com/cssref/css_selectors.asp'",
    styled:    "browser 'https://www.styled-components.com/docs'",
    tsconfig:  "browser 'https://www.typescriptlang.org/docs/handbook/compiler-options.html'",
    tslint:    "browser 'https://palantir.github.io/tslint/rules'",
    types:     "browser 'https://microsoft.github.io/TypeSearch'",
    yarn:      "browser 'https://yarnpkg.com/en/docs/cli'",
  })

  section("Tools")

  script.switch("tool", "search reference docs", {
    angular:   "browser 'https://github.com/angular/angular-cli/wiki'",
  })

  const ref = alias("ref", "reference")
  alias("man", ref())
  alias("docs", ref())

  section("Misc")

  browse("insect", "https://insect.sh/?q=").alias("calc")

  script.outputTo(__dirname, "partials", "urls.sh")
}
