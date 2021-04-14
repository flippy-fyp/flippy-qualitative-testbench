import { Cursor, MusicSheet, Fraction } from "opensheetmusicdisplay"
import Bluebird from "bluebird"
import { CancellablePromise } from "../bluebird/promise"
import {
  CursorTiming,
  Tempo,
  getRequiredStep,
  CursorTimingFraction,
  getTimestampFromVoiceEntries,
  cursorTimingFractionByTimestamp,
  getAdjustedCursorTimings,
} from "./cursorutils"

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
    // console.debug(`MoveCursor to timestamp: ${timestamp}`)
    return new CancellablePromise<void>((resolve, reject, onCancel) => {
      if (onCancel) {
        onCancel(() => {
          // console.debug(`moveCursor Cancelled`)
        })
      }
      try {
        const requiredStep = getRequiredStep(this.cursorTimings, timestamp)
        // console.debug(`MoveCursor to step: ${requiredStep}`)

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
    const unadjustedCursorTimings: CursorTimingFraction[] = []

    while (!this.cursor.Iterator.EndReached) {
      const currEntries = this.cursor.Iterator.CurrentVoiceEntries
      const unadjustedTimestamp = getTimestampFromVoiceEntries(currEntries)
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
