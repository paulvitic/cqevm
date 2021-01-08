import {DomainEvent, EventBus} from "./index";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import {array} from "fp-ts";
import {from, Observable} from "rxjs";

export interface EventLog {
    stream(streamId: O.Option<string | number>): TE.TaskEither<Error, Observable<DomainEvent>>;
    append(event: DomainEvent): TE.TaskEither<Error, void>;
}

export const InMemoryEventLog: (eventBus?: EventBus[]) => EventLog =
        (eventBus?) => {
            const log: Record<string, DomainEvent[]> = {}
            const bus: EventBus[] = eventBus

            return {
                stream: streamId => pipe(
                    streamId,
                    O.fold(() => TE.right(from([])),
                    streamId => pipe(
                        O.fromNullable(log[streamId.toString()]),
                        O.fold(() => TE.right(from([])),
                            events => TE.right(from(events)))
                    ))
                ),
                append: (event: DomainEvent) => pipe(
                    O.fromNullable(log[event.streamId.toString()]),
                    O.fold( () => TE.fromIO(() => { log[event.streamId.toString()] = [event] }),
                            events => TE.fromIO(() => { events.push(event) })),
                    TE.map(() => event),
                    TE.chain(event => pipe(
                        bus,
                        array.traverse(TE.taskEither)(bus => bus.dispatch(event)),
                        TE.map(_ => {}))
                    )
                )
            }
        }
