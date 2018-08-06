import { BashScript } from "./BashScript"

export default function generate() {
  const script = new BashScript()
  const { alias, browse, section } = script

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

  script.outputTo(__dirname, "partials", "web-google.sh")
}
