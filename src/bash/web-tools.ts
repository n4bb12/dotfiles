import { BashScript } from "./BashScript"

export default function generate() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("Tools")

  browse("insect", "https://insect.sh/?q=").alias("calc")

  script.outputTo(__dirname, "partials", "web-tools.sh")
}
