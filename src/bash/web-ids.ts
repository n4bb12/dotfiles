import { BashScript } from "./BashScript"

export default function generate() {
  const sh = new BashScript()

  sh.section("Profile Pages")

  sh.switch("id", "echo Unknown id", {
    gh: "id github",
    github: "browser 'https://github.com/n4bb12'",
    gitlab: "browser 'https://gitlab.com/n4bb12'",
    gl: "id gitlab",
  })

  sh.outputTo(__dirname, "partials", "web-ids.sh")
}
