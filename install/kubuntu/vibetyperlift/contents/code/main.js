// biome-ignore-all lint/correctness/noUndeclaredVariables: workspace is a KWin global

// Vibe Typer pins its waveform to the bottom center and marks the window
// immovable. Shift it up once it appears. Change liftPx to taste.
const liftPx = 200
const parkedIfBottomGapBelow = 150
const fullScreenArea = 4

const watched = new Set()
let lifting = false

function log(message) {
  console.info(`vibetyperlift: ${message}`)
}

function isIndicator(window) {
  if (!window || window.deleted) return false
  const caption = String(window.caption || "")
  if (caption === "Recording Indicator") return true
  const id = `${String(window.resourceClass || "")} ${String(window.resourceName || "")}`.toLowerCase()
  if (!id.includes("vibe")) return false
  const geo = window.frameGeometry
  return geo.height > 20 && geo.height < 480 && geo.width < 1100
}

function lift(window) {
  if (lifting || !isIndicator(window)) return
  const geo = window.frameGeometry
  const area = workspace.clientArea(fullScreenArea, window)
  const gap = area.y + area.height - (geo.y + geo.height)
  if (gap >= parkedIfBottomGapBelow) return
  lifting = true
  const nextY = geo.y - liftPx
  log(
    `lift caption=${window.caption} class=${window.resourceClass} y=${Math.round(geo.y)} -> ${Math.round(nextY)} gap=${Math.round(gap)}`,
  )
  window.frameGeometry = {
    x: geo.x,
    y: nextY,
    width: geo.width,
    height: geo.height,
  }
  lifting = false
}

function watch(window) {
  if (!window || watched.has(window)) {
    lift(window)
    return
  }
  watched.add(window)
  window.frameGeometryChanged.connect(() => lift(window))
  window.captionChanged.connect(() => lift(window))
  window.closed.connect(() => watched.delete(window))
  lift(window)
}

workspace.windowList().forEach(watch)
workspace.windowAdded.connect(watch)
log(`watching, lift=${liftPx}`)
