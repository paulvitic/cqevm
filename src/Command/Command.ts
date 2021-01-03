import {Immutable} from "../Immutable";
import {Value} from "../Value";
import {fromNullable, Option} from "fp-ts/Option";

export type Command<T extends Value> = Immutable<T> & {
    readonly type: string
    readonly streamId: Option<string | number>
}

export const command = <T extends Value>(
    type: string, payload: Immutable<T>, streamId?: string | number): Command<T> =>
    ({
        type,
        streamId: fromNullable(streamId),
        ...payload
    })

