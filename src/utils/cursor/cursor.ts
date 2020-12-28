import { OpenSheetMusicDisplay, MusicSheet, Cursor, VoiceEntry } from "opensheetmusicdisplay/build/dist/src";

export type CursorTiming = {
    stepNumber: number
    timestamp: number
}

export class CursorProcessor {
    private sheet: MusicSheet
    private cursor: Cursor

    // private defaultBpm: number = 120
    private cursorTimings: CursorTiming[]
 
    constructor(osmd: OpenSheetMusicDisplay) {
        this.sheet = osmd.Sheet
        // if (this.sheet.HasBPMInfo) this.defaultBpm = this.sheet.DefaultStartTempoInBpm

        this.cursor = osmd.cursor

        this.cursorTimings = initCursorTimings(this.cursor)
    }
}

/**
 * Returns cursor iterator timings
 * @param cursor OSMD cursor
 */
export const initCursorTimings = (cursor: Cursor): CursorTiming[] => {
    cursor.reset()
    let step = 0
    let ret: CursorTiming[] = []

    while (!cursor.Iterator.EndReached) {
        const currEntries = cursor.Iterator.CurrentVoiceEntries
        const timestamp = getFirstNoteTimestampFromVoiceEntries(currEntries)
        if (timestamp !== undefined) {
            ret.push(
                {
                    stepNumber: step,
                    timestamp: timestamp,
                }
            )
        }
        step++
        cursor.next()
    }

    // sort by timestamp
    ret.sort((a, b) => a.timestamp - b.timestamp)

    cursor.reset()
    return ret
}

/**
 * Returns first note timestamp from given voice entries if present.
 * @param entries VoiceEntries from cursor.Iterator.CurrentVoiceEntries
 */
const getFirstNoteTimestampFromVoiceEntries = (entries: Array<VoiceEntry>): number|undefined => {
    for (const entry of entries) {
        const notes = entry.Notes
        for (const note of notes) {
            return note.getAbsoluteTimestamp().RealValue
        }
    }

    return undefined
}