import { BashScript } from "./BashScript"

generateUrls()

function generateUrls() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("Google Search",
    "https://www.lifewire.com/advanced-google-search-3482174")
  browse("search", "https://www.google.de/search?q=")
  const search = alias("s", "search")

  alias("calc", search())
  alias("define", search("define"))
  alias("google", search())
  alias("stopwatch", search("stopwatch"))
  alias("timer", search("timer"))
  alias("watch", search("watch"))
  alias("weather", search("weather"))

  section("Websites")

  browse("caniuse", "https://caniuse.com/#search=")
  browse("dango", "https://getdango.com/interactive/?banner=0")
  browse("emoji", "http://emoji.muan.co/#").alias("emo")
  browse("escape", "http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php")
  browse("flaticon", "https://www.flaticon.com/search?word=")
  browse("github", "https://github.com/n4bb12/")
  browse("gitlab", "https://gitlab.com/n4bb12/")
  browse("maps", "https://www.google.de/maps/search/")
  browse("music", "https://music.youtube.com/")
  browse("youtube", "https://www.youtube.com/").alias("yt")

  section("References")

  script.switch("reference", "search reference docs", {
    angular:   "browser 'https://github.com/angular/angular-cli/wiki/'",
    cypress:   "browser 'https://yarnpkg.com/en/docs/cli/'",
    icons:     "browser 'https://material.io/tools/icons/?search='",
    lodash:    "browser 'https://lodash.com/docs#'",
    ng:        "browser 'https://github.com/angular/angular-cli/wiki/'",
    node:      "browser 'https://nodejs.org/api/index.html'",
    npm:       "browser 'https://docs.npmjs.com/cli/'",
    package:   "browser 'https://docs.npmjs.com/files/package.json#'",
    pkg:       "browser 'https://docs.npmjs.com/files/package.json#'",
    selectors: "browser 'https://www.w3schools.com/cssref/css_selectors.asp'",
    types:     "browser 'https://microsoft.github.io/TypeSearch'",
    yarn:      "browser 'https://yarnpkg.com/en/docs/cli/'",
  })

  const ref = alias("ref", "reference")
  alias("man", ref())
  alias("docs", ref())

  script.outputTo(__dirname, "partials", "urls.sh")
}
