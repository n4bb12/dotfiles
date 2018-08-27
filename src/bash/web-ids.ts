import { DotScript } from "./DotScript"

export default function generate() {
  const sh = new DotScript()

  sh.section("Profile Pages")

  sh.switch("id", "echo Unknown id", {
    github: "browser 'https://github.com/n4bb12'",
    gitlab: "browser 'https://gitlab.com/n4bb12'",

    gh: "id github",
    gl: "id gitlab",
  })

  sh.outputTo(__dirname, "partials", "web-ids.sh")
}
