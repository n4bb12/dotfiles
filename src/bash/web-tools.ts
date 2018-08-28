import { DotScript } from "./DotScript"

export default function generate() {
  const sh = new DotScript()

  sh.section("Tools")

  sh.browse("bitly",        "https://bitly.com")
  sh.browse("codepad",      "http://codepad.org")
  sh.browse("convert",      "https://www.media.io")
  sh.browse("doodle",       "https://doodle.com/create")
  sh.browse("favicomatic",  "http://www.favicomatic.com").alias("favicons", "appicons")
  sh.browse("filedropper",  "https://www.filedropper.com")
  sh.browse("forms",        "https://docs.google.com/forms").alias("poll")
  sh.browse("gist",         "https://gist.github.com")
  sh.browse("iframely",     "http://iframely.com/debug?uri=").alias("preview")
  sh.browse("insect",       "https://insect.sh/?q=").alias("calculator",    "calc")
  sh.browse("mydevice",     "https://www.mydevice.io/")
  sh.browse("paste",        "https://paste2.org")
  sh.browse("postbin",      "http://postb.in")
  sh.browse("pwned",        "https://haveibeenpwned.com")
  sh.browse("rmbg",         "http://editphotosforfree.com/photoapps/remove-background-from-image-online")
  sh.browse("slides",       "https://slides.google.com")
  sh.browse("speedtest",    "http://speedtest.t-online.de").alias("speed")
  sh.browse("spritegen",    "http://css.spritegen.com").alias("sprites")
  sh.browse("strawpoll",    "https://www.strawpoll.me").alias("straw")
  sh.browse("tineye",       "https://labs.tineye.com/color")
  sh.browse("tinypng",      "https://tinypng.com").alias("panda")
  sh.browse("toolbox",      "https://richardstoolbox.com")
  sh.browse("wolframalpha", "http://www.wolframalpha.com/input/?i=").alias("wolfram", "alpha")

  return sh.outputTo(__filename)
}
