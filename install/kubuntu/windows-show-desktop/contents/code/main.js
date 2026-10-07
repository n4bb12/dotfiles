// biome-ignore-all lint/correctness/noUndeclaredVariables: workspace and registerShortcut are KWin globals

const saved = []
let activeId = null
let desktop = null
let activity = ""
let armed = false
let updating = false

function id(window) {
  return String(window.internalId)
}

function managed(window) {
  return (
    window &&
    !window.deleted &&
    !window.hidden &&
    !window.specialWindow &&
    !window.popupWindow &&
    window.minimizable &&
    (window.normalWindow || window.dialog || window.utility || window.toolbar)
  )
}

function onThisDesktop(window) {
  const desktops = window.desktops
  if (window.onAllDesktops || !desktops || desktops.length === 0) {
    return true
  }
  return desktops.includes(workspace.currentDesktop)
}

function onThisActivity(window) {
  const activities = window.activities
  return !activities || activities.length === 0 || activities.includes(workspace.currentActivity)
}

function shown() {
  const windows = []
  workspace.windowList().forEach((window) => {
    if (managed(window) && !window.minimized && onThisDesktop(window) && onThisActivity(window)) {
      windows.push(window)
    }
  })
  return windows
}

function find(savedId) {
  let found = null
  workspace.windowList().forEach((window) => {
    if (id(window) === savedId) {
      found = window
    }
  })
  return found
}

function disarm() {
  saved.length = 0
  activeId = null
  desktop = null
  activity = ""
  armed = false
}

function minimize() {
  const windows = shown()
  if (windows.length === 0) {
    return
  }
  const active = workspace.activeWindow
  updating = true
  disarm()
  desktop = workspace.currentDesktop
  activity = workspace.currentActivity
  activeId = managed(active) ? id(active) : null
  windows.forEach((window) => {
    saved.push(id(window))
    window.minimized = true
  })
  armed = true
  updating = false
}

function restore() {
  let active = null
  updating = true
  saved.forEach((savedId) => {
    const window = find(savedId)
    if (window?.minimized !== true) {
      return
    }
    if (savedId === activeId) {
      active = window
      return
    }
    window.minimized = false
  })
  if (active) {
    active.minimized = false
    workspace.activeWindow = active
  }
  disarm()
  updating = false
}

function toggle() {
  const samePlace = desktop === workspace.currentDesktop && activity === workspace.currentActivity
  if (armed && samePlace && shown().length === 0) {
    restore()
    return
  }
  minimize()
}

workspace.windowActivated.connect((window) => {
  if (updating || !armed || !managed(window) || window.minimized) {
    return
  }
  if (onThisDesktop(window) && onThisActivity(window)) {
    disarm()
  }
})

registerShortcut("WindowsShowDesktop", "Show Desktop (minimize)", "Meta+D", toggle)
