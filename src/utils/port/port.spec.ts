import * as assert from "assert"
import { parsePortString } from "./port"

suite(`Test parsePortString`, () => {
  const cases = [
    {
      name: "OK",
      input: "123",
      want: 123,
    },
    {
      name: "ignore chars",
      input: "123asdfgasd",
      want: 123,
    },
    {
      name: "NaN",
      input: "Z",
      want: 0,
    },
    {
      name: "Too big",
      input: "123321421",
      want: 65353,
    },
  ]
  for (const tc of cases) {
    test(tc.name, () => {
      const got = parsePortString(tc.input)
      assert.equal(got, tc.want)
    })
  }
})
