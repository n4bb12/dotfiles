import { BashScript } from "./BashScript"

export default function generate() {
  const script = new BashScript()
  const { alias, browse, section } = script

  section("References")

  script.switch("ref", "search 'reference docs'", {
    angular:   "browser 'https://github.com/angular/angular-cli/wiki'",
    cypress:   "browser 'https://docs.cypress.io'",
    enzyme:    "browser 'https://airbnb.io/enzyme/docs/api/'",
    git:       "browser 'https://git-scm.com/docs'",
    icons:     "browser 'https://material.io/tools/icons/?search='",
    insect:    "browser 'https://github.com/sharkdp/insect#reference'",
    jest:      "browser 'https://jestjs.io/docs/en/getting-started'",
    lodash:    "browser 'https://lodash.com/docs#'",
    node:      "browser 'https://nodejs.org/api/index.html'",
    npm:       "browser 'https://docs.npmjs.com/cli'",
    package:   "browser 'https://docs.npmjs.com/files/package.json#'",
    react:     "browser 'https://reactjs.org/docs/getting-started.html'",
    selectors: "browser 'https://www.w3schools.com/cssref/css_selectors.asp'",
    styled:    "browser 'https://www.styled-components.com/docs'",
    tsconfig:  "browser 'https://www.typescriptlang.org/docs/handbook/compiler-options.html'",
    tslint:    "browser 'https://palantir.github.io/tslint/rules'",
    types:     "browser 'https://microsoft.github.io/TypeSearch'",
    yarn:      "browser 'https://yarnpkg.com/en/docs/cli'",

    ng:        "ref angular",
    pkg:       "ref package",
    sc:        "ref styled",
  })

  const ref = alias("reference", "ref")
  alias("man", ref())
  alias("docs", ref())

  script.outputTo(__dirname, "partials", "web-refs.sh")
}
