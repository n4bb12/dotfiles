import { BashScript } from "./BashScript"

export default function generate() {
  const sh = new BashScript()

  sh.section("Tools")

  sh.browse("insect", "https://insect.sh/?q=").alias("calc")

  sh.outputTo(__dirname, "partials", "web-tools.sh")
}
