import {Value} from "../Value";
import {Immutable} from "../Immutable";

export type Query<T extends Value = Value> = {
    readonly type: string
    readonly filter: Immutable<T>
}

export const query = <T extends Value= Value>(
    type: string, filter: Immutable<T>): Query<T> =>
    ({
        type,
        filter
    })
