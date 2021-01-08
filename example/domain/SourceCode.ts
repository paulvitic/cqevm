import {eventStream, EventStream} from "../../src/Command/EventStream";
import {Aggregate, aggregate} from "../../src/Command/Aggregate";
import * as E from "fp-ts/Either";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import {DomainEvent, domainEvent} from "../../src/DomainEvent";
import {v4 as uuidv4} from "uuid";

/////////////////
// Events
/////////////////
export const SOURCE_CODE_REGISTERED = "SOURCE_CODE_REGISTERED"
export type SourceCodeRegistered = {
    name: string
}

//////////////////
// Stream
//////////////////
export type SourceCode = {
    name: string
}

export const EXECUTE_REGISTER_SOURCE_CODE = "EXECUTE_REGISTER_SOURCE_CODE"

export const sourceCode = pipe(
    E.of(eventStream<SourceCode>()),

    E.chainFirst( sc => sc.addReducer(SOURCE_CODE_REGISTERED,
        (event: DomainEvent<SourceCodeRegistered>) => prev => pipe(
            prev,
            O.fold(() => E.tryCatch(() =>
                    aggregate(event.streamId, {name: event.payload.name}, event.sequence), E.toError),
                _ => E.left(new Error("already reduced source code registered"))
            )
        ))
    ),

    E.chainFirst( sc => sc.addExecutor(EXECUTE_REGISTER_SOURCE_CODE,
        (name: string) => (aggregate: O.Option<Aggregate<SourceCode>>) => pipe(
            aggregate,
            E.fromPredicate(agg => O.isNone(agg),
                () => new Error(`Source code already registered`)),
            E.chain(() => E.tryCatch(() =>
                    domainEvent(SOURCE_CODE_REGISTERED, uuidv4(), {name}), E.toError))
        ))
    )
)


