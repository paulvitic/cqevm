import {Value} from "../Value";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import {CommandBus} from "../Command/CommandBus";
import {Command} from "../Command/Command";
import {pipe} from "fp-ts/pipeable";
import {DomainEvent} from "../DomainEvent";

/**
 * Test
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type ExternalStateOutput<V extends Value, C extends Value, D extends Value> =
    (given: V) => (when: Command<C>) => DomainEvent<D>

export type Process<V extends Value, C extends Value> =
    (view: O.Option<V>) => TE.TaskEither<Error, O.Option<Command<C>>>

export type Processor<V extends Value> =
    (view: TE.TaskEither<Error, O.Option<V>>) => TE.TaskEither<Error, void>

export const processor: <V extends Value, C extends Value>(process: Process<V, C>) =>
    (commandBus: CommandBus) => Processor<V> = <V extends Value, C extends Value>(process: Process<V, C>) => {
    return (commandBus: CommandBus) => (view: TE.TaskEither<Error, O.Option<V>>) => pipe(
        view,
        TE.chain(process),
        TE.chain( command => pipe(
            command,
            O.fold( () => TE.right(null),
                command => commandBus.dispatch(command))
        ))
    )
}



