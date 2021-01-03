import {EventLog, DomainEvent} from "../DomainEvent";
import {Option} from "fp-ts/Option";
import {State} from "./State";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import {Value} from "../Value";
import {Command} from "./Command";
import {CommandListener} from "./CommandBus";
import {Aggregate} from "./Aggregate";
import {Observable} from "rxjs";
import {TaskEither} from "fp-ts/TaskEither";

/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type StateChange<S extends Value, T extends Value> =
    (given: Observable<DomainEvent<T>>) => (when: Command<S>) => TaskEither<Error, DomainEvent<T>>

export type StreamReducer<D extends Value, A extends State> =
    (event: DomainEvent<D>) => (aggregate: Option<Aggregate<A>>) => E.Either<Error, Aggregate<A>>

export type CommandExecutor<C extends Value, A extends State, D extends Value> =
    (a: Command<C>) => (a: O.Option<Aggregate<A>>) => E.Either<Error, DomainEvent<D>>

export interface EventStream<C extends Value, A extends State, D extends Value> extends CommandListener<C, D> {
    addReducer(eventType: string, reducer: StreamReducer<D, A>): E.Either<Error, void>
    addExecutor(commandType: string, executor: CommandExecutor<C, A, D>): E.Either<Error, void>
}

export const eventStream: <C extends Value, A extends State, D extends Value>(eventLog: EventLog<D>) => EventStream<C, A, D> =
    <C extends Value, A extends State, D extends Value>(eventLog: EventLog<D>) => {

        const executors: { [commandType: string]: CommandExecutor<C, A, D> } = {}
        const reducers: { [eventType: string]: StreamReducer<D, A> } = {}

        const reduce: (stream: O.Option<Observable<DomainEvent<D>>>) => E.Either<Error, O.Option<Aggregate<A>>> =
            stream => pipe(
                stream,
                O.fold(() => E.right(O.none),
                    stream => E.tryCatch(() => {
                        let state: O.Option<Aggregate<A>> = O.none
                        stream.subscribe(
                            event => pipe(
                                O.fromNullable(reducers[event.type]),
                                E.fromOption(() => new Error("no reducer")),
                                E.chain(reducer => reducer(event)(state)),
                                E.map( nextState => {state = O.some(nextState)})
                            )
                        )
                        return state
                    }, E.toError)
                )
            )

        const execute: (command: Command<C>, executor: CommandExecutor<C, A, D>) =>
            TE.TaskEither<Error, DomainEvent<D>> = (command, executor) => pipe(
            command.streamId,
            O.fold(() => TE.right(O.none), eventLog.stream),
            TE.chain( stream => TE.fromEither(reduce(stream))),
            TE.chain(state => TE.fromEither(executor(command)(state)))
        )

        return {
            commands: () => Object.keys(executors),
            handleCommand: (command: Command<C>) => pipe(
                O.fromNullable(executors[command.type]),
                O.fold( () => TE.right(null),
                    executor => pipe(
                        execute(command, executor),
                        TE.chainFirst( event => eventLog.append(event))
                    )
                )
            ),
            addReducer(eventType: string, reducer: StreamReducer<D, A>): E.Either<Error, void> {
                return pipe(
                    reducers,
                    E.fromPredicate(reducers => pipe(
                            O.fromNullable(reducers[eventType]),
                            O.isNone
                        ),
                        () => new Error('reducer already registered')),
                    E.map(reducers => { reducers[eventType] = reducer })
                )
            },
            addExecutor: (commandType: string, executor: CommandExecutor<C, A, D>) =>
                pipe(
                    executor,
                    E.fromPredicate(
                        _m => O.isNone(O.fromNullable(executors[commandType])),
                        () => new Error("executor already registered")),
                    E.map(executor => {
                        executors[commandType] = executor;
                    })
                )
        }
}


