import type { Group } from "./classify.ts"

export type Sample = {
  t: number
  memTotalMb: number
  memUsedMb: number
  swapTotalMb: number
  swapUsedMb: number
  /** Cumulative since boot, so the report can compute per-minute rates. */
  swapInMb: number
  swapOutMb: number
  stallFullUs: number
  groups: Group[]
  /** `.wslconfig` as it was when the WSL VM started, so the settings in effect. */
  wslconfig?: Record<string, string>
  windows?: {
    /** Apps outside the WSL VM, by working set. */
    appsMb: number
    groups: { name: string; mb: number }[]
    physicalMb?: number
    availableMb?: number
    commitMb?: number
    commitLimitMb?: number
    pagefileMb?: number
  }
}

type Minute = Sample & {
  stallMin: number
  swapInDeltaMb: number
  swapOutDeltaMb: number
}

const MAX_GAP_MS = 10 * 60_000
const PRESSURE_STALL_MIN = 0.05
const PRESSURE_SWAP_IN_MB = 100
const EPISODE_MERGE_MS = 3 * 60_000
const BUCKET_MS = 15 * 60_000

function counterDelta(current: number, previous: number) {
  return current >= previous ? current - previous : 0
}

/** Turns cumulative kernel counters into per-sample deltas. A gap or reset (WSL restart) counts as zero. */
export function toMinutes(samples: Sample[]) {
  return samples.map((sample, index): Minute => {
    const previous = samples[index - 1]

    if (!previous || sample.t - previous.t > MAX_GAP_MS) {
      return { ...sample, stallMin: 0, swapInDeltaMb: 0, swapOutDeltaMb: 0 }
    }

    return {
      ...sample,
      stallMin: counterDelta(sample.stallFullUs, previous.stallFullUs) / 60e6,
      swapInDeltaMb: counterDelta(sample.swapInMb, previous.swapInMb),
      swapOutDeltaMb: counterDelta(sample.swapOutMb, previous.swapOutMb),
    }
  })
}

function isPressured(minute: Minute) {
  return minute.stallMin >= PRESSURE_STALL_MIN || minute.swapInDeltaMb >= PRESSURE_SWAP_IN_MB
}

function footprint(sample: Sample) {
  return sample.memUsedMb + sample.swapUsedMb
}

function peakOf<T>(items: T[], value: (item: T) => number) {
  return items.reduce((best, item) => (value(item) > value(best) ? item : best))
}

function groupMb(group: Group) {
  return group.rssMb + group.swapMb
}

export function findEpisodes(minutes: Minute[]) {
  const episodes: { before?: Minute; minutes: Minute[] }[] = []

  minutes.forEach((minute, index) => {
    if (!isPressured(minute)) {
      return
    }

    const last = episodes.at(-1)
    const lastMinute = last?.minutes.at(-1)

    if (last && lastMinute && minute.t - lastMinute.t <= EPISODE_MERGE_MS) {
      last.minutes.push(minute)
      return
    }

    episodes.push({ before: minutes[index - 1], minutes: [minute] })
  })

  return episodes.map(({ before, minutes }) => {
    const peak = peakOf(minutes, footprint)
    const baseline = new Map((before?.groups ?? []).map((group) => [group.label, groupMb(group)]))

    const grew = peak.groups
      .map((group) => ({ group, mb: groupMb(group) - (baseline.get(group.label) ?? 0) }))
      .filter(({ mb }) => mb >= 100)
      .sort((a, b) => b.mb - a.mb)
      .slice(0, 5)

    return {
      start: minutes[0]?.t ?? peak.t,
      end: minutes.at(-1)?.t ?? peak.t,
      peak,
      stallMin: minutes.reduce((sum, minute) => sum + minute.stallMin, 0),
      swapInMb: minutes.reduce((sum, minute) => sum + minute.swapInDeltaMb, 0),
      grew,
    }
  })
}

function clock(t: number) {
  const date = new Date(t)

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function gb(mb: number) {
  return (mb / 1024).toFixed(1)
}

function size(mb: number) {
  return mb >= 1024 ? `${gb(mb)} GB` : `${Math.round(mb)} MB`
}

function limitsOf(sample: Sample) {
  const settings = Object.entries(sample.wslconfig ?? {})
    .map(([key, value]) => `${key}=${value}`)
    .join(" ")

  const config = sample.wslconfig ? settings || "no .wslconfig" : ".wslconfig unknown"

  return `${config} (VM ${gb(sample.memTotalMb)} GB RAM, ${gb(sample.swapTotalMb)} GB swap)`
}

function windowsFree(sample: Sample) {
  const availableMb = sample.windows?.availableMb

  return typeof availableMb === "number" ? gb(availableMb) : "?"
}

function groupLine(heading: string, index: number, amount: string, group: Group) {
  return `  ${(index ? "" : heading).padEnd(8)} ${amount.padStart(8)}  ${group.label} (${group.count})`
}

function renderEpisodes(minutes: Minute[]) {
  const episodes = findEpisodes(minutes)

  if (!episodes.length) {
    return ["No memory pressure."]
  }

  const lines = ["Pressure episodes (all processes waiting on memory, or heavy reads back from swap)"]

  for (const episode of episodes) {
    lines.push(
      "",
      `${clock(episode.start)}–${clock(episode.end)}  RAM ${gb(episode.peak.memUsedMb)} GB · swap ${gb(episode.peak.swapUsedMb)} GB · waited ${episode.stallMin.toFixed(1)} min · swap-in ${size(episode.swapInMb)} · Windows free ${windowsFree(episode.peak)} GB`,
    )

    episode.grew.forEach(({ group, mb }, index) => {
      lines.push(groupLine("grew", index, `+${size(mb)}`, group))
    })

    episode.peak.groups.slice(0, 5).forEach((group, index) => {
      lines.push(groupLine("largest", index, size(groupMb(group)), group))
    })
  }

  return lines
}

function renderTimeline(minutes: Minute[]) {
  const buckets = new Map<number, Minute[]>()

  for (const minute of minutes) {
    const key = Math.floor(minute.t / BUCKET_MS) * BUCKET_MS
    buckets.set(key, [...(buckets.get(key) ?? []), minute])
  }

  const lines = [
    "Timeline (busiest minute per 15 min, GB; wait in min; win = free on Windows)",
    "time     RAM  swap  wait   win  largest",
  ]

  let limits = ""

  for (const [key, bucket] of buckets) {
    for (const minute of bucket) {
      const next = limitsOf(minute)

      if (next !== limits) {
        lines.push(`${clock(minute.t)}  -- limits: ${next}`)
        limits = next
      }
    }

    const peak = peakOf(bucket, footprint)
    const wait = bucket.reduce((sum, minute) => sum + minute.stallMin, 0)

    const largest = peak.groups
      .slice(0, 3)
      .map((group) => `${group.label} ${gb(groupMb(group))}`)
      .join(" · ")

    lines.push(
      `${clock(key)}  ${gb(peak.memUsedMb).padStart(5)} ${gb(peak.swapUsedMb).padStart(5)} ${wait.toFixed(1).padStart(5)} ${windowsFree(peak).padStart(5)}  ${largest}`,
    )
  }

  return lines
}

function renderSummary(minutes: Minute[]) {
  const ram = peakOf(minutes, (minute) => minute.memUsedMb)
  const swap = peakOf(minutes, (minute) => minute.swapUsedMb)
  const stallMin = minutes.reduce((sum, minute) => sum + minute.stallMin, 0)
  const swapOutMb = minutes.reduce((sum, minute) => sum + minute.swapOutDeltaMb, 0)
  const swapInMb = minutes.reduce((sum, minute) => sum + minute.swapInDeltaMb, 0)

  const lines = [
    `WSL      RAM peak ${gb(ram.memUsedMb)} of ${gb(ram.memTotalMb)} GB (${clock(ram.t)}) · swap peak ${gb(swap.swapUsedMb)} of ${gb(swap.swapTotalMb)} GB (${clock(swap.t)})`,
    `         waited on memory ${stallMin.toFixed(1)} min · swapped out ${size(swapOutMb)}, back in ${size(swapInMb)}`,
  ]

  const withSystem = minutes.filter((minute) => typeof minute.windows?.availableMb === "number")

  if (withSystem.length) {
    const low = peakOf(withSystem, (minute) => -(minute.windows?.availableMb ?? 0))
    const commit = peakOf(withSystem, (minute) => minute.windows?.commitMb ?? 0)
    const pagefile = peakOf(withSystem, (minute) => minute.windows?.pagefileMb ?? 0)

    lines.push(
      `Windows  free low ${windowsFree(low)} of ${gb(low.windows?.physicalMb ?? 0)} GB (${clock(low.t)}) · commit peak ${gb(commit.windows?.commitMb ?? 0)} of ${gb(commit.windows?.commitLimitMb ?? 0)} GB (${clock(commit.t)}) · page file peak ${size(pagefile.windows?.pagefileMb ?? 0)}`,
    )
  }

  const withApps = minutes.filter((minute) => !!minute.windows?.groups.length)

  if (withApps.length) {
    const peak = peakOf(withApps, (minute) => minute.windows?.appsMb ?? 0)
    const largest = (peak.windows?.groups ?? [])
      .slice(0, 5)
      .map((group) => `${group.name} ${size(group.mb)}`)
      .join(", ")

    lines.push(`         apps peak ${gb(peak.windows?.appsMb ?? 0)} GB (${clock(peak.t)}) · ${largest}`)
  }

  return lines
}

export function renderReport(day: string, samples: Sample[]) {
  if (!samples.length) {
    return `No samples for ${day}.`
  }

  const minutes = toMinutes(samples)
  const first = minutes[0]
  const last = minutes.at(-1)

  const header = `Memory ${day} · ${clock(first?.t ?? 0)}–${clock(last?.t ?? 0)} · ${minutes.length} samples`

  return [header, "", ...renderSummary(minutes), "", ...renderEpisodes(minutes), "", ...renderTimeline(minutes)].join(
    "\n",
  )
}
