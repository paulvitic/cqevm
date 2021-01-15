import {Value} from "../Value";
import {Query} from "./Query";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import {Observable} from "rxjs";
import {DomainEvent} from "../DomainEvent";
import * as E from "fp-ts/Either";


/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type StateView<V extends Value> =
    (when: Observable<DomainEvent>) => E.Either<Error, V>

export interface QueryListener<V extends Value> {
    queries: () => string[],
    handleQuery: (query: Query) => TE.TaskEither<Error, O.Option<V>>
}
