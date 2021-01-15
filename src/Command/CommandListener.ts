import {Command} from "./Command";
import {TaskEither} from "fp-ts/TaskEither";
import {DomainEvent} from "../DomainEvent";
import {State} from "./State";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import {pipe} from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import {CommandExecutor, EventStream, StreamAggregator} from "./EventStream";
import {Observable} from "rxjs";

/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type StateChange = (given: Observable<DomainEvent>) => (when: Command) => TaskEither<Error, DomainEvent>

export type CommandListener<A extends State = State> = {
    commands: () => string[],
    changeState: StateChange
    bindExecutor: (commandType: string,
                   map: (command: Command) => any[],
                   stream: EventStream<A>,
                   executorName: string) => E.Either<Error, void>
}

export const commandListener: <A extends State>() => CommandListener<A> =
    <A extends State>() => {

        const handlers: { [commandType: string]: {
                reduce: StreamAggregator<A>
                map: (command: Command) => any[]
                execute: CommandExecutor<A> } } = {}

        return {
            commands: () => Object.keys(handlers),
            changeState: given => when => pipe(
                O.fromNullable(handlers[when.type]),
                O.map(handler => pipe(
                    TE.fromEither(handler.reduce(given)),
                    TE.chain( state => TE.fromEither(handler.execute(when)(state)))
                )),
                O.getOrElse(() => TE.right(null))
            ),
            bindExecutor: (commandType: string,
                           map: (command: Command) => any[],
                           stream: EventStream<A>,
                           executorName: string) => pipe(
                handlers,
                E.fromPredicate(executors => pipe(
                    O.fromNullable(executors[commandType]),
                    O.isNone
                ), () => new Error('executor already registered')),
                E.chain(executors => pipe(
                    pipe(
                        E.Do,
                        E.apS('reduce', E.of(stream.reduce)),
                        E.apS('map', E.of(map)),
                        E.apSW('execute', pipe(
                            stream.bind(executorName),
                            E.fromOption(() => new Error()))),
                    ),
                    E.map( executor => { executors[commandType] = executor })
                ))
            )
        }
    }
