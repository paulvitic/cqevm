import {Value} from "../Value";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import {Subject} from "rxjs";
import {filter} from "rxjs/operators";
import {Query} from "./Query";
import * as O  from "fp-ts/Option";
import {pipe} from "fp-ts/pipeable";

export interface QueryListener<Q extends Value, V extends Value> {
    queries: () => string[],
    handleQuery: (query: Query<Q>) => TE.TaskEither<Error, O.Option<V>>
}

export interface QueryBus<Q extends Value, V extends Value> {
    subscribe(queryListener: QueryListener<Q, V>): E.Either<Error, void>
    dispatch(query: Query<Q>): TE.TaskEither<Error, O.Option<V>>
}

export const InMemoryQueryBus: <Q extends Value, V extends Value>() => QueryBus<Q, V> =
    <Q extends Value, V extends Value>() => {
        const in$ = new Subject<Query<Q>>()
        const out$ = new Subject<E.Either<Error, O.Option<V>>>()
        return {
            subscribe: (queryListener: QueryListener<Q, V>) => E.tryCatch(() => {
                in$
                    .pipe(filter(query => queryListener.queries().includes(query.type)))
                    .subscribe(async query => out$.next(await queryListener.handleQuery(query)()))
            }, E.toError),
            dispatch: (query: Query<Q>) => TE.tryCatch(() => new Promise<O.Option<V>>(
                (resolve, reject) => {
                    const subs = out$.subscribe(event => {
                        subs.unsubscribe();
                        pipe(event, E.fold(reject, resolve))
                    })
                    in$.next(query);
                }), E.toError)
        }
    }
