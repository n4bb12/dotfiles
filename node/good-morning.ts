import chalk from "chalk"
import Nehemiah from "nehemiah"
import { dirname, relative, resolve } from "path"
import { inspect } from "util"

const rootDir = process.env.REPOSITORY_HOME!

function announceRepo(repo: string) {
  console.log(chalk.blue(relative(rootDir, repo)))
}

function handleError(error: Error) {
  console.error(chalk.red(inspect(error)))
}

async function runCommand(n: Nehemiah, cmd: string) {
  console.log(chalk.gray(`$ ${cmd}`))
  return n.run("git fetch --prune")
}

async function updateRepo(repo: string) {
  const cwd = resolve(rootDir, repo)
  announceRepo(cwd)

  const n = new Nehemiah(cwd)

  return Promise.all([runCommand(n, "git fetch --prune")])
}

async function goodMorning() {
  if (!rootDir) {
    throw new Error("Environment variable REPOSITORY_HOME must be set")
  }

  const n = new Nehemiah(resolve(rootDir))
  const globbyOptions = { onlyDirectories: true, deep: 3 } as any // FIXME
  const dotGitDirs = await n.find("**/.git", globbyOptions)
  const repos = dotGitDirs.map(dotGit => dirname(dotGit))

  for (const repo of repos) {
    try {
      await updateRepo(repo)
    } catch (error) {
      handleError(error)
    }
  }
}

goodMorning().catch(handleError)
