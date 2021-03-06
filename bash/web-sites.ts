import { DotScript } from "./DotScript"

export async function generateWebSites() {
  const sh = new DotScript()

  sh.section("Websites")

  sh.browse("circleci", "https://circleci.com/gh/n4bb12")
  sh.browse("contacts", "https://contacts.google.com")
  sh.browse("dango", "https://getdango.com/interactive/?banner=0")
  sh.browse("escape", "http://www.theukwebdesigncompany.com/articles/entity-escape-characters.php")
  sh.browse("github", "https://github.com/n4bb12")
  sh.browse("gitlab", "https://gitlab.com/n4bb12")
  sh.browse("mail", "https://mail.google.com")
  sh.browse("music", "https://music.youtube.com")
  sh.browse("pull-requests", "https://github.com/pulls")
  sh.browse("wallpapers", "https://interfacelift.com/wallpaper/downloads/date/wide_16:9/3840x2160/")
  sh.browse("youtube", "https://www.youtube.com")

  return sh.outputTo(__filename)
}
