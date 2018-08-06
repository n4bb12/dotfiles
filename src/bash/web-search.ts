import { BashScript } from "./BashScript"

export default function generate() {
  const sh = new BashScript()

  sh.section("Other Search")

  sh.browse("caniuse", "https://caniuse.com/#search=")
  sh.browse("langs", "http://ionicabizau.github.io/github-profile-languages/?user=")
  sh.browse("emoji", "http://emoji.muan.co/#").alias("emo")
  sh.browse("flaticon", "https://www.flaticon.com/search?word=")
  sh.browse("maps", "https://www.google.de/maps/search/")

  sh.outputTo(__dirname, "partials", "web-search.sh")
}
