import { expect, test } from "bun:test"

import { renderReport, type Sample } from "./report.ts"

process.env.TZ = "UTC"

const START = Date.UTC(2026, 0, 1, 14, 0)

function sampleAt(minute: number, memUsedMb: number, swapUsedMb: number, stallSec: number, tscMb: number) {
  return {
    t: START + minute * 60_000,
    memTotalMb: minute < 20 ? 20_480 : 24_576,
    memUsedMb,
    swapTotalMb: 8192,
    swapUsedMb,
    swapInMb: swapUsedMb * 2,
    swapOutMb: swapUsedMb * 3,
    stallFullUs: stallSec * 1e6,
    groups: [
      { label: "Cursor server", count: 3, rssMb: 2300, swapMb: 0 },
      { label: "tsc · shop", count: 2, rssMb: tscMb, swapMb: 0 },
    ].sort((a, b) => b.rssMb - a.rssMb),
    wslconfig: minute < 20 ? { memory: "20GB", swap: "8GB" } : { memory: "24GB", swap: "8GB" },
    windows: {
      appsMb: 11_000,
      groups: [{ name: "chrome", mb: 3400 }],
      physicalMb: 32_000,
      availableMb: 12_000 - memUsedMb / 2,
      commitMb: 30_000 + swapUsedMb,
      commitLimitMb: 53_000,
      pagefileMb: swapUsedMb / 4,
    },
  } satisfies Sample
}

test("renderReport explains what grew during memory pressure", () => {
  const samples = [
    sampleAt(0, 6000, 100, 0, 0),
    sampleAt(1, 12_000, 100, 0, 6000),
    sampleAt(2, 19_800, 4000, 20, 13_000),
    sampleAt(3, 19_900, 7800, 50, 14_000),
    sampleAt(4, 9000, 2000, 51, 0),
    sampleAt(20, 8000, 1500, 51, 0),
  ]

  expect(renderReport("2026-01-01", samples)).toMatchInlineSnapshot(`
    "Memory 2026-01-01 · 14:00–14:20 · 6 samples

    WSL      RAM peak 19.4 of 20.0 GB (14:03) · swap peak 7.6 of 8.0 GB (14:03)
             waited on memory 0.8 min · swapped out 22.6 GB, back in 15.0 GB
    Windows  free low 2.0 of 31.3 GB (14:03) · commit peak 36.9 of 51.8 GB (14:03) · page file peak 1.9 GB
             apps peak 10.7 GB (14:00) · chrome 3.3 GB

    Pressure episodes (all processes waiting on memory, or heavy reads back from swap)

    14:02–14:03  RAM 19.4 GB · swap 7.6 GB · waited 0.8 min · swap-in 15.0 GB · Windows free 2.0 GB
      grew      +7.8 GB  tsc · shop (2)
      largest   13.7 GB  tsc · shop (2)
                 2.2 GB  Cursor server (3)

    Timeline (busiest minute per 15 min, GB; wait in min; win = free on Windows)
    time     RAM  swap  wait   win  largest
    14:00  -- limits: memory=20GB swap=8GB (VM 20.0 GB RAM, 8.0 GB swap)
    14:00   19.4   7.6   0.8   2.0  tsc · shop 13.7 · Cursor server 2.2
    14:20  -- limits: memory=24GB swap=8GB (VM 24.0 GB RAM, 8.0 GB swap)
    14:15    7.8   1.5   0.0   7.8  Cursor server 2.2 · tsc · shop 0.0"
  `)
})
