import Nehemiah from "nehemiah"

//
//
//   npm config
//   https://docs.npmjs.com/misc/config
//
// ================================================

export default async () => {
  const n = new Nehemiah()

  await n.run(`npm config set color always`)
  await n.run(`npm config set editor code`)
  await n.run(`npm config set git-tag-version true`)
  await n.run(`npm config set progress true`)
  await n.run(`npm config set shell bash`)
}
