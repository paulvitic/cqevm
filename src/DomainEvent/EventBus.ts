import {DomainEvent} from "./DomainEvent";
import {Subject} from "rxjs";
import {TaskEither, tryCatch as tryCatchPromise} from "fp-ts/TaskEither";
import {filter} from "rxjs/operators";
import {Either, toError, tryCatch} from "fp-ts/Either";
import {EventListener} from "./EventListener";

export interface EventBus {
    subscribe(eventListener: EventListener): Either<Error, void>
    dispatch(event: DomainEvent): TaskEither<Error, void>
}

export const InMemoryEventBus: () => EventBus = () => {
    const subject = new Subject<DomainEvent>()
    return {
        subscribe: (eventListener: EventListener) => tryCatch(() => {
            subject
                .pipe(filter(event => eventListener.events().includes(event.type)))
                .subscribe(async event => await eventListener.handleEvent(event)())
            }, toError),
        dispatch: (event: DomainEvent) => tryCatchPromise(
            () => Promise.resolve(subject.next(event)), toError)
    }
}
