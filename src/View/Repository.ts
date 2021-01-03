import {Value} from "../Value";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

export interface Repository<V extends Value> {
    get(): TE.TaskEither<Error, O.Option<V>>
    set(view: V): TE.TaskEither<Error, void>
}

export const InMemoryRepository: <V extends Value>() => Repository<V> =
    <V>() => {
    let current: O.Option<V> = O.none
    return {
        get: () => TE.right(current),
        set: (view: V) => TE.tryCatch(() => new Promise<void>(resolve => {
            current = O.some(view)
            resolve()
        }), E.toError)
    }
}
