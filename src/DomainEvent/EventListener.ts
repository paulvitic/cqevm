import {DomainEvent} from "./DomainEvent";
import {TaskEither} from "fp-ts/TaskEither";
import {Value} from "../Value";
import {Observable} from "rxjs";
import * as E from "fp-ts/Either";

/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type StateView<V extends Value> =
    (when: Observable<DomainEvent>) => E.Either<Error, V>

export interface EventListener {
    events: () => string[],
    handleEvent: (event: DomainEvent) => TaskEither<Error, void>
}
