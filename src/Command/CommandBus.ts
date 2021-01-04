import {Command} from "./Command";
import * as TE from "fp-ts/TaskEither";
import {Value} from "../Value";
import {pipe} from "fp-ts/pipeable";
import {TaskEither} from "fp-ts/TaskEither";
import {Subject} from "rxjs";
import * as E from "fp-ts/Either";
import {DomainEvent} from "../DomainEvent";
import {filter} from "rxjs/operators";

export type CommandListener<C extends Value, D extends Value> = {
    commands: () => string[],
    handleCommand: (command: Command<C>) => TaskEither<Error, DomainEvent<D>>
}

export interface CommandBus<C extends Value, D extends Value> {
    subscribe(commandListener: CommandListener<C, D>): E.Either<Error, void>;
    dispatch(command: Command<C>): TE.TaskEither<Error, DomainEvent<D>>;
}

export const InMemoryCommandBus: <C extends Value, D extends Value>() => CommandBus<C, D> =
    <C extends Value, D extends Value>() => {
        const in$ = new Subject<Command<C>>()
        const out$ = new Subject<E.Either<Error,DomainEvent<D>>>()
        return {
            subscribe: (commandListener: CommandListener<C, D>) => E.tryCatch(() => {
                in$.pipe(
                    filter<Command<C>>(command => commandListener.commands().includes(command.type))
                ).subscribe(async command => out$.next(await commandListener.handleCommand(command)()))
                }, E.toError),
            dispatch: (command: Command<C>) => TE.tryCatch(() => new Promise<DomainEvent<D>>(
                (resolve, reject) => {
                    const subs = out$.subscribe(event => {
                        subs.unsubscribe();
                        pipe(event, E.fold(reject, resolve))
                    })
                    in$.next(command);
                }), E.toError)
        }
    }
