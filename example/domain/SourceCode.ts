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

export const DEPLOYMENT_REPORT_SOURCE_RECORDED = "DEPLOYMENT_REPORT_SOURCE_RECORDED"
export type DeploymentReportSourceRecorded = {
    nextReportDate: number
}

export const DEPLOYMENTS_COUNTED = "DEPLOYMENTS_COUNTED"
export type DeploymentsCounted = {
    reportDate: number
    count: number
    nextReportDate: number
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

    E.chainFirst( stream => stream.reducerFor(SOURCE_CODE_REGISTERED,
        (event: DomainEvent<SourceCodeRegistered>) => state => pipe(
            state,
            O.fold(() => E.tryCatch(() =>
                    aggregate(event.streamId, {name: event.payload.name}, event.sequence), E.toError),
                _ => E.left(new Error("already reduced source code registered"))
            )
        ))
    ),

    E.chainFirst( stream => stream.executor(EXECUTE_REGISTER_SOURCE_CODE,
        (name: string) => (state: O.Option<Aggregate<SourceCode>>) => pipe(
            state,
            E.fromPredicate(state => O.isNone(state),
                () => new Error(`Source code already registered`)),
            E.chain(() => E.tryCatch(() =>
                    domainEvent(SOURCE_CODE_REGISTERED, uuidv4(), {name}, 0), E.toError))
        ))
    )
)


