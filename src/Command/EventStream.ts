import {DomainEvent} from "../DomainEvent";
import {Option} from "fp-ts/Option";
import {State} from "./State";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import {Value} from "../Value";
import {Aggregate} from "./Aggregate";
import {Observable} from "rxjs";

export type StreamReducer<A extends State> =
    (event: DomainEvent) => (aggregate: Option<Aggregate<A>>) => E.Either<Error, Aggregate<A>>

export type StreamAggregator<A extends State> =
    (stream: Observable<DomainEvent>) => E.Either<Error, O.Option<Aggregate<A>>> // todo: can this be optional??

export type CommandExecutor<A extends State> =
    (...args: any[]) => (state: O.Option<Aggregate<A>>) => E.Either<Error, DomainEvent>

export interface EventStream<A extends State> {
    addReducer(eventType: string, reducer: StreamReducer<A>): E.Either<Error, void>
    aggregate: StreamAggregator<A>
    addExecutor(name: string, executor: CommandExecutor<A>): E.Either<Error, void>
    executor(name: string): O.Option<CommandExecutor<A>>
}

export const eventStream: <A extends State>() => EventStream<A> =
    <A extends State, D extends Value>() => {

        const executors: { [name: string]: CommandExecutor<A> } = {}
        const reducers: { [eventType: string]: StreamReducer<A> } = {}

        return {
            commands: () => Object.keys(executors),
            addReducer: (eventType: string, reducer: StreamReducer<A>): E.Either<Error, void> =>
                pipe(
                    reducers,
                    E.fromPredicate(reducers => pipe(
                        O.fromNullable(reducers[eventType]),
                        O.isNone
                    ), () => new Error('reducer already registered')),
                    E.map(reducers => { reducers[eventType] = reducer })
                ),
            aggregate: stream => E.tryCatch(() => {
                let state: O.Option<Aggregate<A>> = O.none
                stream.subscribe(
                    event => pipe(
                        O.fromNullable(reducers[event.type]),
                        E.fromOption(() => new Error("no reducer")),
                        E.chain(reducer => reducer(event)(state)),
                        E.map( nextState => { state = O.some(nextState) }))
                )
                return state
            }, E.toError),
            addExecutor: (commandType: string, executor: CommandExecutor<A>) =>
                pipe(
                    executor,
                    E.fromPredicate(
                        _m => O.isNone(O.fromNullable(executors[commandType])),
                        () => new Error("executor already registered")),
                    E.map(executor => {
                        executors[commandType] = executor;
                    })
                ),
            executor: (name: string): Option<CommandExecutor<A>> => O.fromNullable(executors[name])
        }
}


