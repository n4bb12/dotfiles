import { DotScript } from "./DotScript"

export default function generate() {
  const sh = new DotScript()

  sh.section("Google Search", "https://www.lifewire.com/advanced-google-search-3482174")

  sh.browse("search", "https://www.google.de/search?q=")
  const search = sh.alias("s", "search")

  sh.alias("define", search("define"))
  sh.alias("google", search())
  sh.alias("stopwatch", search("stopwatch"))
  sh.alias("timer", search("timer"))
  sh.alias("watch", search("watch"))
  sh.alias("weather", search("weather"))

  return sh.outputTo(__filename)
}
