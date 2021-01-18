import * as assert from 'assert'
import { getLastLineNumber } from './follower'

suite(`Test getLastLineNumber`, () => {
    const cases = [
        {
            name: 'Empty',
            lines: [],
            want: undefined,
        },
        {
            name: 'One',
            lines: [`3.14`],
            want: parseFloat(`3.14`),
        },
        {
            name: 'non floats',
            lines: [`foo`, `bar`],
            want: undefined,
        },
        {
            name: 'get last float',
            lines: [`3.14`, `6.28`, `42`, `foo`, `bar`],
            want: parseFloat(`42`),
        },
    ]

    for (const tc of cases) {
        test(tc.name, async () => {
            const got = await getLastLineNumber(tc.lines)
            assert.equal(got, tc.want)
        })
    }
})
