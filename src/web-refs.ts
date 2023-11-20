import { DotScript } from "./DotScript"

export async function generateWebRefs() {
  const sh = new DotScript()

  sh.section("References")

  sh.switch("ref", "search 'reference docs'", {
    angular: "browser 'https://angular.dev/api'",
    cypress: "browser 'https://docs.cypress.io/api/table-of-contents'",
    easings: "browser 'https://easings.net/de'",
    git: "browser 'https://git-scm.com/docs'",
    jest: "browser 'https://jestjs.io/docs/en/getting-started'",
    lodash: "browser 'https://lodash.com/docs#'",
    node: "browser 'https://nodejs.org/api/index.html'",
    npm: "browser 'https://docs.npmjs.com/cli/commands'",
    package: "browser 'https://docs.npmjs.com/cli/configuring-npm/package-json'",
    playwright: "browser 'https://playwright.dev/python/docs/api/class-playwright'",
    pnpm: "browser 'https://pnpm.io/cli/add'",
    react: "browser 'https://react.dev/reference/react'",
    selectors: "browser 'https://www.w3schools.com/cssref/css_selectors.asp'",
    tsconfig: "browser 'https://www.typescriptlang.org/docs/handbook/compiler-options.html'",
    yarn: "browser 'https://yarnpkg.com/cli'",

    ng: "ref angular",
    pkg: "ref package",
    sc: "ref styled",
  })

  const ref = sh.alias("reference", "ref")
  sh.alias("man", ref())
  sh.alias("docs", ref())

  return sh.outputTo(__filename)
}
