import Nehemiah from "nehemiah"

//
//
//   npm config
//   https://docs.npmjs.com/misc/config
//
// ================================================

export default async () => {
  const n = new Nehemiah()

  return Promise.all([
    n.run(`npm config set color always`),
    n.run(`npm config set editor code`),
    n.run(`npm config set git-tag-version true`),
    n.run(`npm config set progress true`),
    n.run(`npm config set shell bash`),
  ]).then(results => undefined)
}
