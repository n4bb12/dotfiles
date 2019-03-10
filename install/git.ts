import Nehemiah from "nehemiah"

//
//
//   git config
//   https://git-scm.com/docs/git-config
//
// ================================================

export default async () => {
  const n = new Nehemiah()

  await n.run(`git config --global core.autocrlf false`)
  await n.run(`git config --global core.editor "code --wait"`)
  await n.run(`git config --global diff.tool "vs-code"`)
  await n.run(`git config --global difftool.cmd "code --wait --diff $LOCAL $REMOTE"`)
  await n.run(`git config --global push.default current`)
  await n.run(`git config --global push.followTags true`)
  await n.run(`git config --global log.date iso`)
  await n.run(`git config --global pull.rebase true`)
}
