import Nehemiah from "nehemiah"

//
//
//   scoop
//   https://github.com/lukesampson/scoop
//
// ================================================

export default async () => {
  const n = new Nehemiah()

  await n.run(`command -v scoop && scoop update || powershell 'iwr -useb get.scoop.sh | iex'`)
  await n.run(`scoop bucket add extras`)
}
