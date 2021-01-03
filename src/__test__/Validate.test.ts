import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/lib/Apply'

describe('', () => {
    const value1: E.Either<Error, string> = E.right('a')
    const value2: E.Either<Error, number> = E.right(1)
    const value3: E.Either<Error, boolean> = E.right(true)
    it.skip('', () => {
        // with sequenceS
        // will give static error if incompatible left side types
        const x = sequenceS(E.Applicative)({ a: value1, b: value2, c: value3 })

        // better with apS / apSW
        const y = pipe(
            E.Do,
            E.apS('a', value1),
            E.apS('b', value2),
            E.apSW('c', value3)
        )
        /*
        -----------------v---------------v
        const y: E.Either<string | boolean, {
            a: string;
            b: number;
            c: boolean;
        }>
        */
    })
})







