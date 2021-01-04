import * as util from "util";
import {Identity} from "../Identity";
import {Immutable} from "../Immutable";
import {Value} from "../Value";

export interface ValueObject<T extends Value = Value> extends Identity<ValueObject<T>> {
    value: Immutable<T>
}

export const valueOf: <T extends Value>(value: Immutable<T>) => ValueObject<T> =
    <T extends Value>(value: Immutable<T>)  => ({
    value,
    equals: other => util.isDeepStrictEqual(other.value, value),
    toString: () => JSON.stringify(value)
})
