import * as assert from "assert"
import { Fraction, VoiceEntry } from "opensheetmusicdisplay"
import {
  getTimestampFromVoiceEntries,
  getAdjustedCursorTimings,
  getRequiredStep,
  CursorTiming,
  CursorTimingFraction,
  Tempo,
} from "./cursorutils"

suite(`Test getTimestampFromVoiceEntries`, () => {
  class MockNote {
    private timestamp: Fraction

    constructor(timestamp: Fraction) {
      this.timestamp = timestamp
    }

    public getAbsoluteTimestamp = (): Fraction => {
      return this.timestamp
    }
  }
  const cases: {
    name: string
    entries: VoiceEntry[]
    want: Fraction | undefined
  }[] = [
    {
      name: "Empty",
      entries: [] as unknown as VoiceEntry[],
      want: undefined,
    },
    {
      name: "One entry",
      entries: [
        {
          Notes: [new MockNote(new Fraction(1, 2))],
        } as unknown as VoiceEntry,
      ],
      want: new Fraction(1, 2),
    },
    {
      name: "One empty and one with one entry",
      entries: [
        {
          Notes: [],
        } as unknown as VoiceEntry,
        {
          Notes: [new MockNote(new Fraction(1, 2))],
        } as unknown as VoiceEntry,
      ],
      want: new Fraction(1, 2),
    },
  ]

  for (const tc of cases) {
    test(tc.name, () => {
      const got = getTimestampFromVoiceEntries(tc.entries)
      if (tc.want !== undefined) {
        if (!got) {
          assert.fail(`want ${tc.want} got undefined`)
        }
        assert.equal(tc.want.CompareTo(got), 0)
      } else {
        assert.equal(got, undefined)
      }
    })
  }
})

suite(`Test getAdjustedCursorTimings`, () => {
  const cases: {
    name: string
    unadjustedCursorTimings: CursorTimingFraction[]
    tempoList: Tempo[]
    want: CursorTiming[]
  }[] = [
    {
      name: "empty",
      unadjustedCursorTimings: [],
      tempoList: [],
      want: [],
    },
    {
      name: "120BPM default",
      unadjustedCursorTimings: [
        { stepNumber: 69, timestamp: new Fraction(0, 4) },
        { stepNumber: 70, timestamp: new Fraction(1, 4) },
      ],
      tempoList: [],
      want: [
        { stepNumber: 69, timestamp: 0.0 },
        { stepNumber: 70, timestamp: 0.5 },
      ],
    },
    {
      name: "60BPM",
      unadjustedCursorTimings: [
        { stepNumber: 69, timestamp: new Fraction(0, 4) },
        { stepNumber: 70, timestamp: new Fraction(1, 4) },
      ],
      tempoList: [
        {
          bpm: 60,
          timestamp: new Fraction(0, 4),
        },
      ],
      want: [
        { stepNumber: 69, timestamp: 0.0 },
        { stepNumber: 70, timestamp: 1.0 },
      ],
    },
    {
      name: "60BPM change to 120BPM",
      unadjustedCursorTimings: [
        { stepNumber: 69, timestamp: new Fraction(0, 4) },
        { stepNumber: 70, timestamp: new Fraction(1, 4) },
        { stepNumber: 71, timestamp: new Fraction(2, 4) },
        { stepNumber: 72, timestamp: new Fraction(3, 4) },
      ],
      tempoList: [
        {
          bpm: 60,
          timestamp: new Fraction(0, 4),
        },
        {
          bpm: 120,
          timestamp: new Fraction(2, 4),
        },
      ],
      want: [
        { stepNumber: 69, timestamp: 0.0 },
        { stepNumber: 70, timestamp: 1.0 },
        { stepNumber: 71, timestamp: 2.0 },
        { stepNumber: 72, timestamp: 2.5 },
      ],
    },
    {
      name: "tempoList in future, unused",
      unadjustedCursorTimings: [
        { stepNumber: 69, timestamp: new Fraction(0, 4) },
        { stepNumber: 70, timestamp: new Fraction(1, 4) },
      ],
      tempoList: [
        {
          bpm: 60,
          timestamp: new Fraction(42, 4),
        },
      ],
      want: [
        { stepNumber: 69, timestamp: 0.0 },
        { stepNumber: 70, timestamp: 0.5 },
      ],
    },
  ]

  for (const tc of cases) {
    test(tc.name, () => {
      const got = getAdjustedCursorTimings(
        tc.unadjustedCursorTimings,
        tc.tempoList
      )
      assert.deepEqual(got, tc.want)
    })
  }
})

suite(`Test getRequiredStep`, () => {
  const cursorTimings: CursorTiming[] = [
    {
      stepNumber: 0,
      timestamp: 0,
    },
    {
      stepNumber: 1,
      timestamp: 1,
    },
    {
      stepNumber: 2,
      timestamp: 2,
    },
    {
      stepNumber: 3,
      timestamp: 3,
    },
  ]
  const cases = [
    {
      name: "Zero",
      timestamp: 0,
      want: 0,
    },
    {
      name: "Two",
      timestamp: 2,
      want: 2,
    },
    {
      name: "Tie and prefer front",
      timestamp: 0.5,
      want: 0,
    },
    {
      name: "Closer to next",
      timestamp: 0.51,
      want: 1,
    },
    {
      name: "Closer to prev",
      timestamp: 0.49,
      want: 0,
    },
    {
      name: "Too large",
      timestamp: 4.1,
      want: 3,
    },
    {
      name: "Too small",
      timestamp: -1,
      want: 0,
    },
  ]

  for (const tc of cases) {
    test(tc.name, () => {
      const got = getRequiredStep(cursorTimings, tc.timestamp)
      assert.equal(got, tc.want)
    })
  }
})
