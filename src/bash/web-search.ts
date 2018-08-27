import { DotScript } from "./DotScript"

export default function generate() {
  const sh = new DotScript()

  sh.section("Other Search")

  sh.browse("caniuse", "https://caniuse.com/#search=")
  sh.browse("emoji",   "https://gist.github.com/rxaviers/7360908")
  sh.browse("maps",    "https://www.google.de/maps/search/")
  sh.browse("scholar", "https://scholar.google.com/")

  sh.alias("emo",   "emoji")
  sh.alias("icon",  "emoji")
  sh.alias("icons", "emoji")

  sh.outputTo(__dirname, "partials", "web-search.sh")
}
