import * as assert from "assert"
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay"
import {
  getDivElement,
  preludeTestFile,
  getScore,
} from "../testutils/testutils"
import preludeCursorTimingsJson from "../../test/testxml/prelude-cursor-timings.test.json"
import { CursorProcessor } from "./cursor"

suite(`Test CursorProcessor`, () => {
  test(`Test with BWV846 Prelude`, async () => {
    try {
      const osmd = new OpenSheetMusicDisplay(getDivElement(document), {
        autoResize: false,
      })
      // @ts-ignore
      global.DOMParser = window.DOMParser

      const scorePath = getScore(preludeTestFile)

      await osmd.load(scorePath)
      osmd.render()

      const cProc = new CursorProcessor(osmd.cursor, osmd.Sheet)

      const got = cProc.getCursorTimings()
      const want = preludeCursorTimingsJson
      assert.deepEqual(want, got)
    } catch (err) {
      assert.fail(err)
    }
  }).timeout(10000)
})
