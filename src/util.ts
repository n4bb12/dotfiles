import path from "path"

function cwd(...paths: string[]): string {
  return path.join(process.cwd(), ...paths)
}

function filename(filepath: string): string {
  return path.basename(filepath, path.extname(filepath))
}

export default {
  cwd,
  filename,
}
