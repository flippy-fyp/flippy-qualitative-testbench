import * as assert from 'assert';
import { adder } from '../../utils/adder';

suite('Test-adder', () => {
    test(`Test adder`, () => {
        assert.equal(adder(1, 2), 3)
    })
});