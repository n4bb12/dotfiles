import { findEpisodes, type Sample, toMinutes } from "./report.ts"

export type Day = { day: string; samples: Sample[] }

function round(value: number, digits: number) {
  const factor = 10 ** digits

  return Math.round(value * factor) / factor
}

/**
 * Columns per day instead of one object per sample, and labels as indices into one table,
 * so a day of minutes stays a few hundred KB inside the page.
 */
export function pageData(days: Day[]) {
  return days
    .filter(({ samples }) => samples.length)
    .map(({ day, samples }) => {
      const minutes = toMinutes(samples)
      const labels = new Map<string, number>()

      const id = (label: string) => {
        const known = labels.get(label)

        if (known !== undefined) {
          return known
        }

        labels.set(label, labels.size)

        return labels.size - 1
      }

      const optional = (pick: (minute: (typeof minutes)[number]) => number | undefined) =>
        minutes.map((minute) => pick(minute) ?? null)

      return {
        day,
        t: minutes.map((minute) => minute.t),
        ramUsed: minutes.map((minute) => minute.memUsedMb),
        ramTotal: minutes.map((minute) => minute.memTotalMb),
        swapUsed: minutes.map((minute) => minute.swapUsedMb),
        swapTotal: minutes.map((minute) => minute.swapTotalMb),
        waitSec: minutes.map((minute) => round(minute.stallMin * 60, 1)),
        swapIn: minutes.map((minute) => minute.swapInDeltaMb),
        winFree: optional((minute) => minute.windows?.availableMb),
        winTotal: optional((minute) => minute.windows?.physicalMb),
        commit: optional((minute) => minute.windows?.commitMb),
        commitLimit: optional((minute) => minute.windows?.commitLimitMb),
        groups: minutes.map((minute) =>
          minute.groups.flatMap((group) => [id(group.label), group.count, group.rssMb, group.swapMb]),
        ),
        apps: minutes.map((minute) => (minute.windows?.groups ?? []).flatMap((group) => [id(group.name), group.mb])),
        episodes: findEpisodes(minutes).map((episode) => ({
          start: episode.start,
          end: episode.end,
          peak: episode.peak.t,
          stallMin: round(episode.stallMin, 1),
          swapInMb: episode.swapInMb,
          grew: episode.grew.map(({ group, mb }) => [id(group.label), mb]),
        })),
        labels: [...labels.keys()],
      }
    })
}

export function renderPage(days: Day[], initialDay: string, template: string) {
  // "<" is escaped so a label can never close the script tag.
  const json = JSON.stringify({ generated: Date.now(), initialDay, days: pageData(days) }).replace(/</g, "\\u003c")

  return template.replace("/*DATA*/ null", () => json)
}
