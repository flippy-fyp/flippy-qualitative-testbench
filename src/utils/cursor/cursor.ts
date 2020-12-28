import { OpenSheetMusicDisplay, Cursor, VoiceEntry } from "opensheetmusicdisplay/build/dist/src";

export type CursorTiming = {
    stepNumber: number
    timestamp: number
}

export class CursorProcessor {
    // private sheet: MusicSheet
    private cursor: Cursor

    // private defaultBpm: number = 120
    private cursorTimings: CursorTiming[] = []

    constructor(osmd: OpenSheetMusicDisplay) {
        // this.sheet = osmd.Sheet
        // if (this.sheet.HasBPMInfo) this.defaultBpm = this.sheet.DefaultStartTempoInBpm

        this.cursor = osmd.cursor

        this.initCursorTimings()
    }

    /**
     * @returns cursorTimings 
     */
    public getCursorTimings = (): CursorTiming[] => {
        return this.cursorTimings
    }

    /**
     * Returns cursor iterator timings
     * @param cursor OSMD cursor
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
        this.cursorTimings.sort((a, b) => a.timestamp - b.timestamp)

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

