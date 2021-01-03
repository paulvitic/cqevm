import {DomainEvent, EventBus} from "./index";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import {array} from "fp-ts";
import {from, Observable} from "rxjs";
import {Value} from "../Value";

export interface EventLog<D extends Value> {
    stream(streamId: string | number): TE.TaskEither<Error, O.Option<Observable<DomainEvent<D>>>>;
    append(event: DomainEvent<D>): TE.TaskEither<Error, void>;
}

export const InMemoryEventLog: <D extends Value>(eventBus?: EventBus[]) => EventLog<D> =
        <D extends Value>(eventBus?: EventBus[]) => {
        const log: { [streamId: string ]: DomainEvent<D>[] } = {}
        const bus: EventBus[] = eventBus
        return {
            stream: (streamId) => pipe(
                O.fromNullable(log[streamId.toString()]),
                O.fold(
                    () => TE.right(O.none),
                    events => TE.right(O.some(from(events))
                    )
                ),
            ),
            append: (event: DomainEvent<D>) => pipe(
                O.fromNullable(log[event.streamId.toString()]),
                O.fold( () => TE.tryCatch(() => new Promise<DomainEvent>(resolve => {
                    log[event.streamId.toString()] = [event];
                    resolve(event);
                }), E.toError),
                    events => TE.tryCatch(() => new Promise<DomainEvent>(resolve => {
                        events.push(event);
                        resolve(event);
                    }), E.toError)
                ),
                TE.chain(event => pipe(
                    bus,
                    array.traverse(TE.taskEither)(bus => bus.dispatch(event))
                )),
                TE.map(_ => {})
            )
        }
    }
