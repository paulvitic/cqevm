import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import {Value} from "../Value";
import {DomainEvent} from "./DomainEvent";
import {Subject} from "rxjs";
import {TaskEither} from "fp-ts/TaskEither";
import {filter} from "rxjs/operators";

export interface EventListener<D extends Value> {
    events: () => string[],
    handleEvent: (event: DomainEvent<D>) => TaskEither<Error, void>
}

export interface EventBus {
    subscribe<D extends Value>(eventListener: EventListener<D>): E.Either<Error, void>
    dispatch<D extends Value>(event: DomainEvent<D>): TE.TaskEither<Error, void>
}

export const InMemoryEventBus: <D extends Value>() => EventBus = <D extends Value>() => {
    const subject = new Subject<DomainEvent<D>>()
    return {
        subscribe: (eventListener: EventListener<D>) => E.tryCatch(() => {
            subject
                .pipe(filter(event => eventListener.events().includes(event.type)))
                .subscribe(async event => await eventListener.handleEvent(event)())
            }, E.toError),
        dispatch: (event: DomainEvent<D>) => TE.tryCatch(() => Promise.resolve(subject.next(event)), E.toError)
    }
}
