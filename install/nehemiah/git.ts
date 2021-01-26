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
  await n.run(`git config --global core.eol lf`)
  await n.run(`git config --global core.ignorecase false`)
  await n.run(`git config --global log.date iso`)
  await n.run(`git config --global push.default current`)
  await n.run(`git config --global push.followTags true`)
  await n.run(`git config --global fetch.prune true`)
  await n.run(`git config --global pull.rebase true`)
  await n.run(`git config --global rebase.autosquash true`)
  await n.run(`git config --global core.editor 'code --wait'`)
  await n.run(`git config --global diff.tool 'code'`)
  await n.run(`git config --global difftool.code.cmd 'code --wait --diff $LOCAL $REMOTE'`)
  await n.run(`git config --global alias.lg 'log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --date=relative'`)
}
