import { BashScript } from "./BashScript"

export class DotScript extends BashScript {

  public browse = (alias: string, url: string) => {
    this.push(`${alias}() { browser '${url}' "$@"; }`)
    return {
      alias: (...others: string[]) => {
        others.forEach((other) => this.alias(other, alias))
      },
    }
  }

}
