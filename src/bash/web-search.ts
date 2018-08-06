import { BashScript } from "./BashScript"

export default function generate() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("Other Search")

  browse("caniuse", "https://caniuse.com/#search=")
  browse("langs", "http://ionicabizau.github.io/github-profile-languages/?user=")
  browse("emoji", "http://emoji.muan.co/#").alias("emo")
  browse("flaticon", "https://www.flaticon.com/search?word=")
  browse("maps", "https://www.google.de/maps/search/")

  script.outputTo(__dirname, "partials", "web-search.sh")
}
