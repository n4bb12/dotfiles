import { DotScript } from "./DotScript"

export async function generateWebIds() {
  const sh = new DotScript()

  sh.section("Profile Pages")

  sh.switch("id", "echo Unknown id", {
    github: "browser 'https://github.com/n4bb12'",
    gitlab: "browser 'https://gitlab.com/n4bb12'",

    gh: "id github",
    gl: "id gitlab",
  })

  return sh.outputTo(__filename)
}
