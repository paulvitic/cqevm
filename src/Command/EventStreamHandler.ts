import {DomainEvent} from "../DomainEvent";
import {State} from "./State";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import {Observable} from "rxjs";
import {DomainEntity} from "./DomainEntity";
import {Aggregate} from "./Aggregate";
import * as R from "fp-ts/Record";
import {reduce} from "rxjs/operators";

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

export const reduceWith = <A extends State>(reducer: StreamReducer<A>)=> (stream: Observable<DomainEvent>) =>
    {
        let reduced: E.Either<Error, O.Option<StreamState<A>>> = E.right(O.none)
        stream.pipe(
            reduce(select(reducer), E.right(O.none))
        ).subscribe(state => reduced = state)
        return reduced
    }

/*export const reduceWith = <A extends State>(reducer: StreamReducer<A>) => (stream: Observable<DomainEvent>) =>
    stream.pipe(reduce(select(reducer), E.right(O.none))).toPromise()*/


type Executor<A extends State> =
    (state: O.Option<StreamState<A>>) => (...args: any[]) => E.Either<Error, DomainEvent>

export type CommandExecutor<A extends State> = Record<string, Executor<A>>


export type StreamHandler<A extends State> =
    (stream: Observable<DomainEvent>) => (...args: any[]) => E.Either<Error, DomainEvent>

export type EventStreamHandler<A extends State> = Record<string, StreamHandler<A>>

export const eventStreamHandler: <A extends State>(reducer: StreamReducer<A>, executor: CommandExecutor<A>) => EventStreamHandler<A> =
    <A extends State>(reducer: StreamReducer<A>, executor: CommandExecutor<A>) =>
        pipe(
            executor,
            R.map( executor => (stream: Observable<DomainEvent>) => pipe(
                reduceWith(reducer)(stream),
                E.map(executor),
                E.getOrElse(err => () => E.left(err))
            )
        ))

