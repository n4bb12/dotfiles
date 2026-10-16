import { appendFile, mkdir, readdir, readFile, readlink } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

import { groupBy, labelOf, type ProcessInfo, parseTasklist, parseWslconfig } from "./classify.ts"
import { renderReport, type Sample } from "./report.ts"

const HOME = homedir()
const LOG_DIR = join(process.env.XDG_STATE_HOME ?? join(HOME, ".local", "state"), "memlog")
const KEEP_DAYS = 14
const TOP_GROUPS = 20
const TASKLIST = "/mnt/c/Windows/System32/tasklist.exe"
const POWERSHELL = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"

// Commit is what Windows has promised to programs, RAM plus page file. Near its limit, allocations fail.
const WINDOWS_MEMORY = [
  "$o = Get-CimInstance Win32_OperatingSystem",
  "$p = (Get-CimInstance Win32_PageFileUsage | Measure-Object CurrentUsage -Sum).Sum",
  "@{ profile = $env:USERPROFILE; physicalKb = $o.TotalVisibleMemorySize; availableKb = $o.FreePhysicalMemory; commitLimitKb = $o.TotalVirtualMemorySize; commitFreeKb = $o.FreeVirtualMemory; pagefileMb = $p } | ConvertTo-Json -Compress",
].join("; ")

type ProcessMemory = ProcessInfo & { rssMb: number; swapMb: number }

function dayOf(date: Date) {
  return date.toLocaleDateString("sv-SE")
}

function kbField(text: string, name: string) {
  const match = text.match(new RegExp(`^${name}:\\s+(\\d+)`, "m"))

  return match ? Number(match[1]) : undefined
}

async function run(cmd: string[]) {
  try {
    const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "ignore", timeout: 5000 })
    const text = await new Response(proc.stdout).text()

    return (await proc.exited) === 0 ? text : ""
  } catch {
    return ""
  }
}

async function dockerNames() {
  const text = await run(["docker", "ps", "--no-trunc", "--format", "{{.ID}} {{.Names}}"])

  return new Map(text.split("\n").map((line) => line.split(" ") as [string, string]))
}

// /proc files report size 0, so they are read with readFile instead of Bun.file.
async function readProcess(pid: string, containers: Map<string, string>) {
  try {
    const status = await readFile(`/proc/${pid}/status`, "utf8")
    const rssKb = kbField(status, "VmRSS")

    if (!rssKb) {
      return
    }

    const args = (await readFile(`/proc/${pid}/cmdline`, "utf8")).split("\0").filter(Boolean)
    const cgroup = await readFile(`/proc/${pid}/cgroup`, "utf8")
    const containerId = cgroup.match(/docker-([0-9a-f]{64})/)?.[1]
    const cwd = await readlink(`/proc/${pid}/cwd`).catch(() => undefined)

    return {
      comm: status.match(/^Name:\s+(.*)$/m)?.[1] ?? "",
      args,
      cwd,
      container: containerId ? (containers.get(containerId) ?? containerId.slice(0, 12)) : undefined,
      rssMb: rssKb / 1024,
      swapMb: (kbField(status, "VmSwap") ?? 0) / 1024,
    } satisfies ProcessMemory
  } catch {
    // The process exited while it was read.
  }
}

async function readProcesses() {
  const containers = await dockerNames()
  const pids = (await readdir("/proc")).filter((name) => /^\d+$/.test(name) && Number(name) !== process.pid)
  const processes = await Promise.all(pids.map((pid) => readProcess(pid, containers)))

  return processes.filter((info) => !!info)
}

async function readWindowsApps() {
  const tasks = parseTasklist(await run([TASKLIST, "/fo", "csv", "/nh"]))

  // vmmemWSL is the WSL VM itself, which the Linux side already covers.
  const apps = tasks.filter((task) => !/^vmmem/i.test(task.name))

  const groups = groupBy(
    apps,
    (task) => task.name,
    (task) => task.mb,
    () => 0,
  )

  return {
    appsMb: apps.reduce((sum, task) => sum + task.mb, 0),
    groups: groups.slice(0, 10).map((group) => ({ name: group.label, mb: Math.round(group.rssMb) })),
  }
}

function kbToMb(value: unknown) {
  return typeof value === "number" ? Math.round(value / 1024) : undefined
}

async function readWindowsSystem() {
  const text = await run([POWERSHELL, "-NoProfile", "-NonInteractive", "-Command", WINDOWS_MEMORY])

  if (!text) {
    return
  }

  const value = JSON.parse(text)
  const commitLimitMb = kbToMb(value.commitLimitKb)
  const commitFreeMb = kbToMb(value.commitFreeKb)

  return {
    profile: typeof value.profile === "string" ? value.profile : undefined,
    physicalMb: kbToMb(value.physicalKb),
    availableMb: kbToMb(value.availableKb),
    commitMb: commitLimitMb && commitFreeMb ? commitLimitMb - commitFreeMb : undefined,
    commitLimitMb,
    pagefileMb: typeof value.pagefileMb === "number" ? Math.round(value.pagefileMb) : undefined,
  }
}

/**
 * `.wslconfig` applies when the WSL VM starts, so later edits are not in effect yet.
 * The file is read on the first sample after each start and kept until the next one.
 */
async function activeWslconfig(profile: string | undefined) {
  const bootId = (await readFile("/proc/sys/kernel/random/boot_id", "utf8")).trim()
  const cache = Bun.file(join(LOG_DIR, "boot.json"))
  const cached = (await cache.exists()) ? await cache.json() : undefined

  if (cached?.bootId === bootId) {
    return cached.wslconfig
  }

  if (!profile) {
    return
  }

  const file = Bun.file(join((await run(["wslpath", "-u", profile])).trim(), ".wslconfig"))
  const uptimeSec = Number((await readFile("/proc/uptime", "utf8")).split(" ")[0])
  const exists = await file.exists()
  const editedSinceStart = exists && file.lastModified > Date.now() - uptimeSec * 1000

  // An edit after the start is not in effect, and the settings that are in effect are gone.
  const wslconfig = editedSinceStart ? undefined : exists ? parseWslconfig(await file.text()) : {}

  await Bun.write(cache, JSON.stringify({ bootId, wslconfig }))

  return wslconfig
}

async function sample() {
  const meminfo = await readFile("/proc/meminfo", "utf8")
  const vmstat = await readFile("/proc/vmstat", "utf8")
  const pressure = await readFile("/proc/pressure/memory", "utf8")
  const pageMb = 4096 / 1024 / 1024
  const memTotalKb = kbField(meminfo, "MemTotal") ?? 0
  const swapTotalKb = kbField(meminfo, "SwapTotal") ?? 0
  const [processes, apps, system] = await Promise.all([readProcesses(), readWindowsApps(), readWindowsSystem()])

  await mkdir(LOG_DIR, { recursive: true })

  const wslconfig = await activeWslconfig(system?.profile)

  const groups = groupBy(
    processes,
    (info) => labelOf(info, HOME),
    (info) => info.rssMb,
    (info) => info.swapMb,
  )

  const entry: Sample = {
    t: Date.now(),
    memTotalMb: Math.round(memTotalKb / 1024),
    memUsedMb: Math.round((memTotalKb - (kbField(meminfo, "MemAvailable") ?? 0)) / 1024),
    swapTotalMb: Math.round(swapTotalKb / 1024),
    swapUsedMb: Math.round((swapTotalKb - (kbField(meminfo, "SwapFree") ?? 0)) / 1024),
    swapInMb: Math.round(Number(vmstat.match(/^pswpin (\d+)/m)?.[1] ?? 0) * pageMb),
    swapOutMb: Math.round(Number(vmstat.match(/^pswpout (\d+)/m)?.[1] ?? 0) * pageMb),
    stallFullUs: Number(pressure.match(/^full .*total=(\d+)/m)?.[1] ?? 0),
    groups: groups.slice(0, TOP_GROUPS).map((group) => ({
      ...group,
      rssMb: Math.round(group.rssMb),
      swapMb: Math.round(group.swapMb),
    })),
    wslconfig,
    windows: {
      ...apps,
      physicalMb: system?.physicalMb,
      availableMb: system?.availableMb,
      commitMb: system?.commitMb,
      commitLimitMb: system?.commitLimitMb,
      pagefileMb: system?.pagefileMb,
    },
  }

  await appendFile(join(LOG_DIR, `${dayOf(new Date())}.jsonl`), `${JSON.stringify(entry)}\n`)
  await prune()
}

async function prune() {
  const cutoff = dayOf(new Date(Date.now() - KEEP_DAYS * 86_400_000))

  for (const name of await readdir(LOG_DIR)) {
    if (name.endsWith(".jsonl") && name < cutoff) {
      await Bun.file(join(LOG_DIR, name)).delete()
    }
  }
}

function parseDay(arg: string | undefined) {
  if (arg === "yesterday") {
    return dayOf(new Date(Date.now() - 86_400_000))
  }

  return arg ?? dayOf(new Date())
}

async function report(arg: string | undefined) {
  const day = parseDay(arg)
  const file = Bun.file(join(LOG_DIR, `${day}.jsonl`))
  const text = (await file.exists()) ? await file.text() : ""

  const samples: Sample[] = text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))

  console.log(renderReport(day, samples))
}

const [command, arg] = process.argv.slice(2)

if (command === "sample") {
  await sample()
} else if (command === "report" || !command) {
  await report(arg)
} else {
  console.error("Usage: memlog [report [YYYY-MM-DD|yesterday]] | memlog sample")
  process.exit(1)
}
