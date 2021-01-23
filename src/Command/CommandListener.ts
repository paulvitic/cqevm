import {Command} from "./Command";
import {DomainEvent} from "../DomainEvent";
import {State} from "./State";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import {EventStreamHandler, StreamHandler} from "./EventStreamHandler";
import {Observable} from "rxjs";
import * as R from "fp-ts/Record";
import {pipe} from "fp-ts/pipeable";
import {Either} from "fp-ts/Either";

/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type StateChange = (given: Observable<DomainEvent>) => (when: Command)  => Either<Error, DomainEvent>

export type CommandListener<A extends State = State> = {
    commands: () => string[],
    bindExecutor: (commandType: string,
                   handler: EventStreamHandler<A>,
                   executorName: string,
                   map: (command: Command) => any[]) => E.Either<Error, void>
    changeState: StateChange
}

export const commandListener: <A extends State>() => CommandListener<A> =
    <A extends State>() => {

        const handlers: {
            [commandType: string]: {
                map: (command: Command) => any[]
                handle: StreamHandler<A>
            }
        } = {}

        return {
            commands: () => Object.keys(handlers),
            bindExecutor: (commandType: string,
                           handler: EventStreamHandler<A>,
                           handlerName: string,
                           map: (command: Command) => any[]) => pipe(
                handlers,
                E.fromPredicate(handlers => O.isNone(O.fromNullable(handlers[commandType])),
                    () => new Error('executor already registered')),
                E.chain(handlers => pipe(
                    R.lookup(handlerName, handler),
                    E.fromOption(() => new Error(`no handler with name ${handlerName}`)),
                    E.map( handle => { handlers[commandType] = {map, handle} }))
                )
            ),
            changeState: given => when => pipe(
                O.fromNullable(handlers[when.type]),
                O.map(handler => handler.handle(given)(handler.map(when))),
                O.getOrElse(() => E.right(null))
            )
        }
    }
