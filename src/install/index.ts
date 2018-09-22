import git from "./git"
import npm from "./npm"

(async () => {
  return Promise.all([
    git(),
    npm(),
  ])
})()
