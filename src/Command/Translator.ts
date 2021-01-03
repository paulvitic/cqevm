import {Value} from "../Value";
import {DomainEvent, EventListener} from "../DomainEvent";
import * as E from "fp-ts/Either";
import {Command} from "./Command";
import {CommandBus} from "./CommandBus";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";

/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type ExternalStateInput<V extends Value, C extends Value, D extends Value> =
    (given: DomainEvent<D>) => (when: Command<C>) => TE.TaskEither<Error, DomainEvent<V>>

export type Translation<D extends Value, C extends Value> =
    (event: DomainEvent<D>) => E.Either<Error, O.Option<Command<C>>>

export interface Translator<D extends Value, C extends Value> extends EventListener<D> {
    addTranslation(eventType: string, translation: Translation<D, C>): E.Either<Error, void>
}

export const translator: <D extends Value, C extends Value>(commandBus: CommandBus<C, D>) => Translator<D, C> =
    <D extends Value, C extends Value>(commandBus: CommandBus<C, D>) => {

    const translations : {[eventType: string] : Translation<D, C>} = {}

    return  {
        addTranslation: (eventType: string, translation: Translation<D, C>): E.Either<Error, void> =>
            pipe(
                translations,
                E.fromPredicate(translations => pipe(
                        O.fromNullable(translations[eventType]),
                        O.isNone
                    ),
                    () => new Error('translation already registered')), // todo: can we have multiple translations for same event type?
                E.map(translations => {translations[eventType] = translation })
            ),
        events: () => Object.keys(translations),
        handleEvent: (event: DomainEvent<D>): TE.TaskEither<Error, void> => pipe(
            O.fromNullable(translations[event.type]),
            TE.fromOption(() => new Error("translator not found")),
            TE.chain(translate => pipe(
                translate(event),
                TE.fromEither,
                TE.chain(command => pipe(
                    command,
                    O.map(commandBus.dispatch),
                    O.getOrElse(() => TE.right(null)))
                )
            ))
        )
    }
}

