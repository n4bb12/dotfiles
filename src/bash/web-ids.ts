import { BashScript } from "./BashScript"

export default function generate() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("Profile Pages")

  script.switch("id", "echo Unknown id", {
    gh: "id github",
    github: "browser 'https://github.com/n4bb12'",
    gitlab: "browser 'https://gitlab.com/n4bb12'",
    gl: "id gitlab",
  })

  script.outputTo(__dirname, "partials", "web-ids.sh")
}
