import { BashScript } from "./BashScript"

export default function generate() {
  const sh = new BashScript()

  sh.section("Resources")

  sh.browse("flat-icons",     "https://www.flaticon.com/search?word=")
  sh.browse("fonts",          "https://fonts.google.com/?query=")
  sh.browse("material-icons", "https://material.io/tools/icons/?search=")
  sh.browse("pexels",         "https://www.pexels.com/search/")
  sh.browse("pixabay",        "https://pixabay.com/en/photos/?q=")
  sh.browse("simple-icons",   "https://simpleicons.org/?q=")
  sh.browse("stocksnap",      "https://stocksnap.io/search/")
  sh.browse("interfacelift",  "https://interfacelift.com/wallpaper/downloads/date/wide_16:9/1920x1080/")

  sh.alias("wallpapers", "interfacelift")

  sh.outputTo(__dirname, "partials", "web-resources.sh")
}
