import chalk from "chalk"
import Nehemiah from "nehemiah"
import path from "path"
import { relative, resolve } from "path"

async function gitFetchPrune() {
  if (!process.env.REPOSITORY_HOME) {
    throw new Error("Environment variable REPOSITORY_HOME must be set")
  }

  console.log(chalk.dim.gray("Command:") + " " + chalk.yellow("git fetch --prune"))
  const root = resolve(process.env.REPOSITORY_HOME)

  console.log(chalk.dim.gray("Root:") + " " + chalk.yellow(root))
  const n = new Nehemiah(root)
  const options = { onlyDirectories: true, deep: 1 }
  const gitDirs = await n.find("**/.git", options)
  const projects = gitDirs.map(dir => path.dirname(dir))

  for (const dir of projects) {
    const prefix = chalk.dim.gray("Repository:") + " " + chalk.cyan(dir)
    const project = new Nehemiah(resolve(root, dir))
    console.log(prefix)

    try {
      await project.run("git fetch --prune")
    } catch (error) {
      console.log(prefix + " " + chalk.red("Failed"))
    }
  }
}

gitFetchPrune()
