import chalk from "chalk"
import { lstatSync, readdirSync } from "fs"
import Nehemiah from "nehemiah"
import { basename, join, relative } from "path"

function searchRepositories(dir: string): string[] {
  const results: string[] = []
  const subs = getSubDirectories(dir)
  const subNames = subs.map(sub => basename(sub))

  if (subNames.includes(".git")) {
    results.push(dir)
  } else {
    subs.forEach(sub => {
      searchRepositories(sub).forEach(result => results.push(result))
    })
  }

  return results
}

function getSubDirectories(dir: string) {
  return readdirSync(dir)
    .map(name => join(dir, name))
    .filter(isDirectory)
}

function isDirectory(source: string) {
  return lstatSync(source).isDirectory()
}

async function gitFetchPrune() {
  console.log(chalk.dim.gray("Command:") + " " + chalk.yellow("git fetch --prune"))
  const root = join(process.env.HOME!, "GIT")

  console.log(chalk.dim.gray("Root:") + " " + chalk.yellow(root))
  const projects = searchRepositories(root)

  for (const dir of projects) {
    console.log(chalk.dim.gray("Repository:") + " " + chalk.cyan(relative(root, dir)))
    const n = new Nehemiah(dir)

    try {
      await n.run("git fetch --prune")
    } catch (error) {
      console.log(chalk.dim.gray("Repository:") + " " + chalk.cyan(relative(root, dir)) + " " + chalk.red("Failed"))
    }
  }
}

gitFetchPrune()
