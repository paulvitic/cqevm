import {Command} from "./Command";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/pipeable";
import {Subject} from "rxjs";
import * as E from "fp-ts/Either";
import {DomainEvent, EventLog} from "../DomainEvent";
import {filter} from "rxjs/operators";
import {CommandListener} from "./CommandListener";

export interface CommandBus {
    subscribe(commandListener: CommandListener): E.Either<Error, void>;
    dispatch(command: Command): TE.TaskEither<Error, DomainEvent>;
}


export const InMemoryCommandBus: (eventLog: EventLog) => CommandBus =
    eventLog => {
        const when$ = new Subject<Command>()
        const then$ = new Subject<E.Either<Error,DomainEvent>>()
        return {
            subscribe: (commandListener: CommandListener) => E.tryCatch(() => {
                    when$.pipe(
                        filter<Command>(command => commandListener.commands().includes(command.type))
                    ).subscribe(async when => then$.next(await pipe(
                        TE.of(when.streamId),
                        TE.chain(eventLog.stream),
                        TE.chain( given => commandListener.changeState(given)(when))
                    )()))
                }, E.toError),
            dispatch: (when: Command) => TE.tryCatch(() => new Promise<DomainEvent>(
                (resolve, reject) => {
                    const subs = then$.subscribe(then => {
                        subs.unsubscribe();
                        pipe(then, E.fold(reject, resolve))
                    })
                    when$.next(when);
                }), E.toError)
        }
    }
