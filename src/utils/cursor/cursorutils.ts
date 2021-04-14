import { VoiceEntry, Fraction } from "opensheetmusicdisplay"
import * as bounds from "binary-search-bounds"

export type CursorTiming = {
  stepNumber: number
  timestamp: number
}

export type CursorTimingFraction = {
  stepNumber: number
  timestamp: Fraction
}

export type Tempo = {
  bpm: number
  timestamp: Fraction
}

export const cursorTimingByTimestamp = (a: CursorTiming, b: CursorTiming) =>
  a.timestamp - b.timestamp

export const cursorTimingFractionByTimestamp = (
  a: CursorTimingFraction,
  b: CursorTimingFraction
) => a.timestamp.CompareTo(b.timestamp)

/**
 * Returns first note timestamp
 * from given voice entries if present.
 *
 * @param entries VoiceEntries from cursor.Iterator.CurrentVoiceEntries
 */
export const getTimestampFromVoiceEntries = (
  entries: VoiceEntry[]
): Fraction | undefined => {
  for (const entry of entries) {
    const notes = entry.Notes
    for (const note of notes) {
      return note.getAbsoluteTimestamp()
    }
  }
  return undefined
}

/**
 * Adjust CursorTimings in `unadjustedCursorTimings` and return real timestamps (in seconds)
 * based on tempo entires in `tempoList`.
 *
 * @param unadjustedCursorTimings
 * @param tempoList list of tempi of the sheet
 */
export const getAdjustedCursorTimings = (
  unadjustedCursorTimings: CursorTimingFraction[],
  tempoList: Tempo[]
): CursorTiming[] => {
  let lastTempo: Tempo = {
    bpm: 120, // default to 120
    // 4 is indep of time sig
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    timestamp: new Fraction(0, 4),
  }
  let lastTempoIdx = -1
  let lastAccumulatedTime = 0.0

  return unadjustedCursorTimings.map((ct) => {
    let i = lastTempoIdx + 1
    let searching = true
    while (i < tempoList.length && searching) {
      const t = tempoList[i]
      if (ct.timestamp.CompareTo(t.timestamp) >= 0) {
        const tsGap = Fraction.minus(t.timestamp, lastTempo.timestamp)
        lastAccumulatedTime += (tsGap.RealValue * 60.0 * 4) / lastTempo.bpm
        lastTempo = tempoList[i]
        ++i
      } else {
        searching = false
      }
    }
    lastTempoIdx = i - 1

    const gapToLastTempo = Fraction.minus(ct.timestamp, lastTempo.timestamp)
    return {
      ...ct,
      timestamp:
        lastAccumulatedTime +
        (gapToLastTempo.RealValue * 60.0 * 4) / lastTempo.bpm,
    }
  })
}

/**
 * Get the required step number based on the given timestamp.
 * Based on the closest time difference possible. If tie, return the preceding step.
 *
 * @param cursorTimings
 * @param timestamp
 */
export const getRequiredStep = (
  cursorTimings: CursorTiming[],
  timestamp: number
): number => {
  const ref: CursorTiming = { timestamp, stepNumber: 0 }
  const prevIndex = bounds.le(cursorTimings, ref, cursorTimingByTimestamp)
  const nextIndex = bounds.ge(cursorTimings, ref, cursorTimingByTimestamp)

  if (prevIndex < 0) return 0
  if (nextIndex >= cursorTimings.length) return cursorTimings.last().stepNumber

  const prev = cursorTimings[prevIndex]
  const next = cursorTimings[nextIndex]

  const prevDiff = Math.abs(timestamp - prev.timestamp)
  const nextDiff = Math.abs(timestamp - next.timestamp)

  return prevDiff <= nextDiff ? prev.stepNumber : next.stepNumber
}
