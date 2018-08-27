import { DotScript } from "./DotScript"

export default function generate() {
  const sh = new DotScript()

  sh.section("Websites")

  sh.browse("circleci",      "https://circleci.com/gh/n4bb12")
  sh.browse("contacts",      "https://contacts.google.com")
  sh.browse("dango",         "https://getdango.com/interactive/?banner=0")
  sh.browse("escape",        "http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php")
  sh.browse("github",        "https://github.com/n4bb12")
  sh.browse("gitlab",        "https://gitlab.com/n4bb12")
  sh.browse("mail",          "https://mail.google.com")
  sh.browse("music",         "https://music.youtube.com")
  sh.browse("pull-requests", "https://github.com/pulls")
  sh.browse("wallpapers",    "https://interfacelift.com/wallpaper/downloads/date/wide_16:9/3840x2160/")
  sh.browse("youtube",       "https://www.youtube.com")

  sh.alias("ci",  "circleci")
  sh.alias("gh",  "github")
  sh.alias("gl",  "gitlab")
  sh.alias("prs", "pull-requests")
  sh.alias("yt",  "youtube")

  sh.outputTo(__dirname, "partials", "web-sites.sh")
}
