import { Cursor, VoiceEntry } from "opensheetmusicdisplay/build/dist/src";
import * as bounds from 'binary-search-bounds'
import { CancellablePromise } from "../bluebird/promise";
import Bluebird from "bluebird";

export type CursorTiming = {
    stepNumber: number
    timestamp: number
}

export class CursorProcessor {
    private cursor: Cursor
    private cursorTimings: CursorTiming[] = []
    private currStep: number = 0

    constructor(cursor: Cursor) {
        this.cursor = cursor
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
                const requiredStep = getRequiredStep(this.cursorTimings, timestamp)
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
            }
            catch (err) {
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
     * Initialises this.cursorTimings
     */
    private initCursorTimings = () => {
        this.cursor.reset()
        let step = 0
        this.cursorTimings = []

        while (!this.cursor.Iterator.EndReached) {
            const currEntries = this.cursor.Iterator.CurrentVoiceEntries
            const timestamp = this.getFirstNoteTimestampFromVoiceEntries(currEntries)
            if (timestamp !== undefined) {
                this.cursorTimings.push(
                    {
                        stepNumber: step,
                        timestamp: timestamp,
                    }
                )
            }
            step++
            this.cursor.next()
        }

        // sort by timestamp
        this.cursorTimings.sort(cursorTimingByTimestamp)

        this.cursor.reset()
    }

    /**
     * Returns first note timestamp from given voice entries if present.
     * @param entries VoiceEntries from cursor.Iterator.CurrentVoiceEntries
     */
    private getFirstNoteTimestampFromVoiceEntries = (entries: Array<VoiceEntry>): number | undefined => {
        for (const entry of entries) {
            const notes = entry.Notes
            for (const note of notes) {
                return note.getAbsoluteTimestamp().RealValue
            }
        }

        return undefined
    }
}

const cursorTimingByTimestamp = (a: CursorTiming, b: CursorTiming) => a.timestamp - b.timestamp

/**
 * Get the required step number based on the given timestamp.
 * Based on the closest time difference possible. If tie, return the preceding step.
 * 
 * @param cursorTimings 
 * @param timestamp 
 */
export const getRequiredStep = (cursorTimings: CursorTiming[], timestamp: number): number => {
    const ref: CursorTiming = { timestamp: timestamp, stepNumber: 0 }
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