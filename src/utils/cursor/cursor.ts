import { Cursor, VoiceEntry, MusicSheet, Fraction } from 'opensheetmusicdisplay'
import * as bounds from 'binary-search-bounds'
import { CancellablePromise } from '../bluebird/promise'
import Bluebird from 'bluebird'

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
const cursorTimingByTimestamp = (a: CursorTiming, b: CursorTiming) =>
    a.timestamp - b.timestamp
const cursorTimingFractionByTimestamp = (
    a: CursorTimingFraction,
    b: CursorTimingFraction
) => a.timestamp.CompareTo(b.timestamp)
export class CursorProcessor {
    private cursor: Cursor
    private cursorTimings: CursorTiming[] = []
    private currStep: number = 0
    private tempoList: Tempo[] = []

    constructor(cursor: Cursor, sheet: MusicSheet) {
        this.cursor = cursor
        this.initTempoList(sheet)
        this.initCursorTimings()
    }

    /**
     * @returns cursorTimings
     */
    public getCursorTimings = (): CursorTiming[] => {
        return this.cursorTimings
    }

    public showCursor = () => {
        this.cursor.show()
    }

    /**
     * Moves the cursor to the closest step given the timestamp. If tie between a previous and next
     * timestamp, prefer the previous step.
     *
     * Cancellable.
     *
     * @param timestamp float, in seconds
     */
    public moveCursor = (timestamp: number): Bluebird<void> => {
        console.debug(`MoveCursor to timestamp: ${timestamp}`)
        return new CancellablePromise<void>((resolve, reject, onCancel) => {
            if (onCancel) {
                onCancel(() => {
                    console.debug(`moveCursor Cancelled`)
                })
            }
            try {
                const requiredStep = getRequiredStep(
                    this.cursorTimings,
                    timestamp
                )
                console.debug(`MoveCursor to step: ${requiredStep}`)

                if (requiredStep < this.currStep) {
                    this.cursor.reset()
                    this.cursor.show()
                    this.currStep = 0
                }

                while (this.currStep < requiredStep) {
                    this.cursor.next()
                    this.currStep++
                }

                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * Reset and hide the cursor.
     */
    public reset = () => {
        this.cursor.reset()
        this.cursor.hide()
        this.currStep = 0
    }

    /**
     * Initialises tempoList. Currently we only care about the instantaneous tempo marks.
     *
     * @param sheet MusicSheet
     */
    private initTempoList = (sheet: MusicSheet) => {
        this.tempoList = sheet.TimestampSortedTempoExpressionsList.map((t) => {
            return {
                bpm: t.InstantaneousTempo.TempoInBpm,
                timestamp: t.AbsoluteTimestamp,
            }
        })
        if (sheet.HasBPMInfo) {
            this.tempoList.unshift({
                bpm: sheet.DefaultStartTempoInBpm,
                timestamp: new Fraction(0, 4),
            })
        }
    }

    /**
     * Initialises this.cursorTimings
     */
    private initCursorTimings = () => {
        this.cursor.reset()
        let step = 0
        let unadjustedCursorTimings: CursorTimingFraction[] = []

        while (!this.cursor.Iterator.EndReached) {
            const currEntries = this.cursor.Iterator.CurrentVoiceEntries
            const unadjustedTimestamp = getTimestampFromVoiceEntries(
                currEntries
            )
            if (unadjustedTimestamp !== undefined) {
                unadjustedCursorTimings.push({
                    stepNumber: step,
                    timestamp: unadjustedTimestamp,
                })
            }
            step++
            this.cursor.next()
        }

        // sort by timestamp just to make sure
        unadjustedCursorTimings.sort(cursorTimingFractionByTimestamp)

        this.cursorTimings = getAdjustedCursorTimings(
            unadjustedCursorTimings,
            this.tempoList
        )
        this.cursor.reset()
    }
}

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
                lastAccumulatedTime +=
                    (tsGap.RealValue * 60.0 * 4) / lastTempo.bpm
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
    const ref: CursorTiming = { timestamp: timestamp, stepNumber: 0 }
    const prevIndex = bounds.le(cursorTimings, ref, cursorTimingByTimestamp)
    const nextIndex = bounds.ge(cursorTimings, ref, cursorTimingByTimestamp)

    if (prevIndex < 0) return 0
    if (nextIndex >= cursorTimings.length)
        return cursorTimings.last().stepNumber

    const prev = cursorTimings[prevIndex]
    const next = cursorTimings[nextIndex]

    const prevDiff = Math.abs(timestamp - prev.timestamp)
    const nextDiff = Math.abs(timestamp - next.timestamp)

    return prevDiff <= nextDiff ? prev.stepNumber : next.stepNumber
}
