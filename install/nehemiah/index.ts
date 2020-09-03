import git from "./git"
import npm from "./npm"
import scoop from "./scoop"

Promise.all([git(), npm(), scoop()])
