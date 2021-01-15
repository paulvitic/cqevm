import {Value} from "../Value";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import {peeks, seek, Store} from "fp-ts/Store";
import {identity, pipe} from "fp-ts/function";

export interface Repository<V extends Value> {
    peek(): TE.TaskEither<Error, O.Option<V>>
    update(view: V): TE.TaskEither<Error, void>
}

// Todo: look at Store
export const InMemoryRepository: <V extends Value>() => Repository<V> =
    <V>() => {

    const store: Store<V, O.Option<V>> = {
        peek: O.fromNullable,
        pos: null
    }

    return {
        peek: () => TE.right(pipe(store, peeks(identity))),
        update: (view: V) => TE.tryCatch(() => new Promise<void>(resolve => {
            pipe(store, seek(view))
            resolve()
        }), E.toError)
    }
}
