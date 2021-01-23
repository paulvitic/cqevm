import {Command} from "./Command";
import {pipe} from "fp-ts/pipeable";
import {Subject} from "rxjs";
import {DomainEvent, EventLog} from "../DomainEvent";
import {filter} from "rxjs/operators";
import {CommandListener} from "./CommandListener";
import {TaskEither, tryCatch as tryCatchPromise, } from "fp-ts/TaskEither";
import {Either, toError, fold, tryCatch, map, flatten} from "fp-ts/Either";

export interface CommandBus {
    subscribe(commandListener: CommandListener): Either<Error, void>;
    dispatch(command: Command): TaskEither<Error, DomainEvent>;
}

export const InMemoryCommandBus: (eventLog: EventLog) => CommandBus =
    eventLog => {
        const when$ = new Subject<Command>()
        const then$ = new Subject<Either<Error,DomainEvent>>()
        return {
            subscribe: (listener: CommandListener) => tryCatch(() => {
                when$.pipe(
                    filter<Command>(when => listener.commands().includes(when.type)))
                    .subscribe(async when => then$.next(pipe(
                        await eventLog.stream(when.streamId)(),
                        map(given => listener.changeState(given)(when)),
                        flatten
                    )))
            }, toError),
            dispatch: (when: Command) => tryCatchPromise(() => new Promise<DomainEvent>(
                (resolve, reject) => {
                    const subscription = then$.subscribe(then => {
                        subscription.unsubscribe();
                        pipe(then, fold(reject, resolve))
                    })
                    when$.next(when);
                }), toError)
        }
    }
