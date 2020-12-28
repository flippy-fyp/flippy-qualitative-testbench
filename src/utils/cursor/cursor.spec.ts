import * as assert from 'assert';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import { getDivElement, preludeTestFile, getScore } from '../testutils/testutils';
import preludeCursorTimingsJson from '../../testxml/prelude-cursor-timings.test.json'
import { CursorProcessor, CursorTiming, getRequiredStep } from './cursor';

suite(`Test CursorProcessor`, () => {
    test(`Test with BWV846 Prelude`, async () => {
        try {
            const osmd = new OpenSheetMusicDisplay(getDivElement(document), {autoResize: false})
            // @ts-ignore
            global.DOMParser = window.DOMParser
            
            const scorePath = getScore(preludeTestFile)

            await osmd.load(scorePath)
            osmd.render()

            const cProc = new CursorProcessor(osmd.cursor)
            
            const got = cProc.getCursorTimings()
            const want = preludeCursorTimingsJson

            assert.deepEqual(want, got)
        }
        catch (err) {
            assert.fail(err)
        }
    }).timeout(10000)
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