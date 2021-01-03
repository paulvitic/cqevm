import {Value} from "../Value";
import {Immutable} from "../Immutable";

export type Query<T extends Value> = Immutable<T> & {
    readonly type: string
}

export const query = <T extends Value>(
    type: string, filter: Immutable<T>): Query<T> =>
    ({
        type,
        ...filter
    })
