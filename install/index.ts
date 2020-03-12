import git from "./git"
import npm from "./npm"

Promise.all([git(), npm()])
