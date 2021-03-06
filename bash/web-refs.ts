import { DotScript } from "./DotScript"

export async function generateWebRefs() {
  const sh = new DotScript()

  sh.section("References")

  sh.switch("ref", "search 'reference docs'", {
    angular: "browser 'https://github.com/angular/angular-cli/wiki'",
    cypress: "browser 'https://docs.cypress.io'",
    ease: "browser 'https://easings.net/de'",
    enzyme: "browser 'https://airbnb.io/enzyme/docs/api/'",
    git: "browser 'https://git-scm.com/docs'",
    insect: "browser 'https://github.com/sharkdp/insect#reference'",
    jest: "browser 'https://jestjs.io/docs/en/getting-started'",
    lodash: "browser 'https://lodash.com/docs#'",
    node: "browser 'https://nodejs.org/api/index.html'",
    npm: "browser 'https://docs.npmjs.com/cli'",
    package: "browser 'https://docs.npmjs.com/files/package.json#'",
    react: "browser 'https://reactjs.org/docs/getting-started.html'",
    selectors: "browser 'https://www.w3schools.com/cssref/css_selectors.asp'",
    styled: "browser 'https://www.styled-components.com/docs'",
    tsconfig: "browser 'https://www.typescriptlang.org/docs/handbook/compiler-options.html'",
    tslint: "browser 'https://palantir.github.io/tslint/rules'",
    yarn: "browser 'https://yarnpkg.com/en/docs/cli'",
    pnpm: "browser 'https://pnpm.io'",

    ng: "ref angular",
    pkg: "ref package",
    sc: "ref styled",
  })

  const ref = sh.alias("reference", "ref")
  sh.alias("man", ref())
  sh.alias("docs", ref())

  return sh.outputTo(__filename)
}
