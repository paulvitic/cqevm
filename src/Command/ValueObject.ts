import * as util from "util";
import {Identity} from "../Identity";
import {Immutable} from "../Immutable";
import {Value} from "../Value";

export type ValueObject<T extends Value> = Immutable<T> & Identity<ValueObject<T>>

export const valueOf: <T extends Value>(a: Immutable<T>) => ValueObject<T> = a => ({
    ...a,
    equals: other => util.isDeepStrictEqual(a, other),
    toString: () => JSON.stringify(a)
})
