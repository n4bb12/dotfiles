import { BashScript } from "./BashScript"

export default function generate() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("Websites")

  browse("contacts", "https://contacts.google.com")
  browse("dango", "https://getdango.com/interactive/?banner=0")
  browse("escape", "http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php")
  browse("github", "https://github.com/n4bb12")
  browse("gitlab", "https://gitlab.com/n4bb12")
  browse("mail", "https://mail.google.com")
  browse("music", "https://music.youtube.com")
  browse("youtube", "https://www.youtube.com")
  browse("wallpapers", "https://interfacelift.com/wallpaper/downloads/date/wide_16:9/3840x2160/")

  script.outputTo(__dirname, "partials", "web-sites.sh")
}
