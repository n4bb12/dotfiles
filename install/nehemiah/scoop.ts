import Nehemiah from "nehemiah"

//
//
//   git config
//   https://docs.npmjs.com/misc/config
//
// ================================================

export default async () => {
  const n = new Nehemiah()

  return Promise.all([
    n.run(`command -v scoop && scoop update || powershell 'iwr -useb get.scoop.sh | iex'`),
    n.run(`scoop bucket add extras`),
  ]).then(results => undefined)
}
