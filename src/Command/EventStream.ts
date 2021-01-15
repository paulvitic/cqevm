import {DomainEvent} from "../DomainEvent";
import {Option, none, getOrElse} from "fp-ts/Option";
import {State} from "./State";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

import {Value} from "../Value";
import {Observable} from "rxjs";
import {DomainEntity} from "./DomainEntity";
import {Aggregate} from "./Aggregate";
import {lookup, map as mapRecord} from "fp-ts/Record";
import {tryCatch} from "fp-ts/TaskEither";
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

type StateReducer<T extends State> = (previous: E.Either<Error, Option<StreamState<T>>>, event: DomainEvent) =>
    E.Either<Error, Option<StreamState<T>>>

export interface EventStream<A extends State> {
    reduce: Record<string, StateReducer<A>>
    execute: Record<string, CommandExecutor<A>>
}

export type StreamReducer<A extends State> = Record<string, StateReducer<A>>

/*const selectReducer: <A extends State>(stream: StreamReducer<A>) =>
    (previous: Either<Error, Option<StreamState<A>>>, event: DomainEvent) => Either<Error, Option<StreamState<A>>> =
    stream => (previous, event) => pipe(
        lookup(event.type, stream),
        fromOption(() => new Error("reducer not found")),
        chain(reducer => reducer(previous, event))
    )*/

const selectReduce = <A extends State>(reducer: StreamReducer<A>) =>
    (previous: E.Either<Error, Option<StreamState<A>>>, event: DomainEvent) =>
        pipe(
            lookup(event.type, reducer),
            getOrElse(() => (_previous, _event) => E.left(new Error(`no reducer for ${event.type}`)))
        )(previous, event)

//getOrElse(() => (previous, _) => previous)(lookup(event.type, reducer))(previous, event)

/*export const reduceUsing: <A extends State>(stream: EventStream<A>) =>
    (events: DomainEvent[]) => Either<Error, StreamState<A>> =
    stream => events => pipe(
        events,
        reduce(E.right(none), selectReducer(stream)),
        map(fromOption(() => new Error('could not reduce stream'))),
        flatten
    )*/

export const reduceStream = <A extends State>(reducer: StreamReducer<A>) =>
    (stream: Observable<DomainEvent>) => 
        pipe(
            TE.tryCatch(() => stream.pipe(
                reduce(selectReduce(reducer), E.right(none)),
                map(TE.fromEither)
            ).toPromise(), E.toError),
            TE.flatten
        )
        

/*export type StreamReducer<A extends State> =
    (event: DomainEvent) => (aggregate: Option<StreamState<A>>) => E.Either<Error, StreamState<A>>

// todo: look at State
export type StreamAggregator<A extends State> =
    (stream: Observable<DomainEvent>) => E.Either<Error, O.Option<StreamState<A>>>*/

export type CommandExecutor<A extends State> =
    (...args: any[]) => (state: O.Option<StreamState<A>>) => E.Either<Error, DomainEvent>

/*export interface EventStream<A extends State> {
    reducerFor(eventType: string, reducer: StreamReducer<A>): E.Either<Error, void>
    reduce: StreamAggregator<A>
    executor(name: string, executor: CommandExecutor<A>): E.Either<Error, void>
    bind(name: string): O.Option<CommandExecutor<A>>
}*/

/*export const eventStream: <A extends State>() => EventStream<A> =
    <A extends State, D extends Value>() => {

        const executors: { [name: string]: CommandExecutor<A> } = {}
        const reducers: { [eventType: string]: StreamReducer<A> } = {}

        return {
            reducerFor: (eventType: string, reducer: StreamReducer<A>): E.Either<Error, void> =>
                pipe(
                    reducers,
                    E.fromPredicate(reducers => pipe(
                        O.fromNullable(reducers[eventType]),
                        O.isNone
                    ), () => new Error('reducer already registered')),
                    E.map(reducers => { reducers[eventType] = reducer })
                ),
            reduce: stream => E.tryCatch(() => {
                let state: O.Option<StreamState<A>> = O.none
                stream.subscribe(
                    event => pipe(
                        O.fromNullable(reducers[event.type]),
                        E.fromOption(() => new Error("no reducer")),
                        E.chain(reducer => reducer(event)(state)),
                        E.map( nextState => { state = O.some(nextState) })))
                return state
            }, E.toError),
            executor: (commandType: string, executor: CommandExecutor<A>) =>
                pipe(
                    O.fromNullable(executors[commandType]),
                    O.fold( () => E.tryCatch(() => {
                        executors[commandType] = executor; }, E.toError),
                    _e => E.left(new Error("executor already registered"))
                    )
                ),
            bind: (name: string): Option<CommandExecutor<A>> => O.fromNullable(executors[name])
        }
}*/


