import {DomainEvent} from "../DomainEvent";
import {State} from "./State";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import {Observable} from "rxjs";
import {DomainEntity} from "./DomainEntity";
import {Aggregate} from "./Aggregate";
import * as R from "fp-ts/Record";
import {map, reduce} from "rxjs/operators";

// we want to give a function to application layer
// command => curry(
//    executor function that gives newly generated event,
//    reducer Function that gives state,
//    eventStream[comes from eventLog based on command data])

export interface StreamState<T extends State> extends DomainEntity<T> {
    readonly playHead: number
}

export const stateOf = <T extends State>(
    id: string | number,
    state: T,
    playHead?: number): Aggregate<T> =>
    ({
        id,
        playHead: playHead ? playHead : 0,
        state,
        equals: other => other.id === id,
        toString: () => JSON.stringify({id, playHead, state})
    })


type Reducer<T extends State> = (previous: O.Option<StreamState<T>>, event: DomainEvent) =>
    E.Either<Error, O.Option<StreamState<T>>>

export type StreamReducer<A extends State> = Record<string, Reducer<A>>

const select = <A extends State>(reducer: StreamReducer<A>) =>
    (previous: E.Either<Error, O.Option<StreamState<A>>>, event: DomainEvent) => pipe(
        previous,
        E.chain(previous => pipe(
            R.lookup(event.type, reducer),
            O.getOrElse(() =>
                (_, event) => E.left(new Error(`no reducer for ${event.type}`)))
            )(previous, event)
        )
    )

export const reduceWith = <A extends State>(reducer: StreamReducer<A>) => (stream: Observable<DomainEvent>) =>
    pipe(
        TE.tryCatch(() => stream.pipe(
            reduce(select(reducer), E.right(O.none)),
            map(TE.fromEither)).toPromise(), E.toError),
        TE.flatten
    )


type Executor<A extends State> =
    (state: TE.TaskEither<Error, O.Option<StreamState<A>>>) => (...args: any[]) => TE.TaskEither<Error, DomainEvent>

export type CommandExecutor<A extends State> = Record<string, Executor<A>>


export type StreamHandler<A extends State> =
    (stream: Observable<DomainEvent>) => (...args: any[]) => TE.TaskEither<Error, DomainEvent>

export type EventStreamHandler<A extends State> = Record<string, StreamHandler<A>>

export const eventStreamHandler = <A extends State>(reducer: StreamReducer<A>, executor: CommandExecutor<A>) =>
    pipe(
        executor,
        R.map( executor => (stream: Observable<DomainEvent>) => executor(reduceWith(reducer)(stream)))
    )


