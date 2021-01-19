import * as RTE from "fp-ts/ReaderTaskEither";
import *as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as IO from "fp-ts/IO";
import * as A from "fp-ts/Array";
import {constant, flow, pipe} from "fp-ts/function";

describe('', () => {

    it('should ', async () => {
        const result = await pipe(
            {},
            RTE.fromIO(() => 1)
        )()
        expect(result).toStrictEqual(E.right(1))
    });
})

describe('side effect', () => {
    // fixture
    const href = "http://example.com?someParam=2&searchTerm=wafflehouse"

    // curried
    const split = (del:string) => (s: string) => s.split(del)
    const eq = (s: string) => that => s === that

    // url :: IO String
    // const url = new IO(() => window.location.href);
    const url = IO.fromIO(() => href);

    // toPairs :: String -> [[String]]
    // const toPairs = compose(map(split('=')), split('&'));
    const toPairs = flow(split('&'), A.map(split('=')));

    // params :: String -> [[String]]
    // const params = compose(toPairs, last, split('?'));
    const params = flow(split('?'), A.last, O.map(toPairs), O.getOrElse(constant(A.empty)));

    // findParam :: String -> IO Maybe [String]
    // const findParam = key => map(compose(Maybe.of, find(compose(eq(key), head)), params), url);
    const findParam = key => pipe(url, IO.map(flow(params, A.findFirst(flow(A.head, O.exists(eq(key)))))));

    it('should find', () => {
        // -- Impure calling code ----------------------------------------------

        // run it by calling $value()!
        // findParam('searchTerm').$value();
        // Just(['searchTerm', 'wafflehouse'])

        const expected = O.some(['searchTerm', 'wafflehouse'])
        const actual = findParam('searchTerm')();
        expect(actual).toStrictEqual(expected)
    });
})
