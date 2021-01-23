import {eventStreamHandler, CommandExecutor, StreamReducer} from "../../src/Command/EventStreamHandler";
import {aggregate} from "../../src/Command/Aggregate";
import * as E from "fp-ts/Either";
import {pipe} from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import {DomainEvent, domainEvent} from "../../src/DomainEvent";
import {v4 as uuidv4} from "uuid";
import {sourceCodeRegistered, SourceCodeRegistered} from "./SourceCodeEvents";

export type SourceCode = {
    name: string
}

const sourceCodeReducer: StreamReducer<SourceCode> = {
    sourceCodeRegistered: (previous, event: DomainEvent<SourceCodeRegistered>) => pipe(
        previous,
        O.fold(() => E.tryCatch(() => O.some(
            aggregate(event.streamId, {name: event.payload.name}, event.sequence)), E.toError),
            _ => E.left(new Error("source code already registered"))
        )
    )
}

const sourceCodeExecutor: CommandExecutor<SourceCode> = {
    registerSourceCode: state => (name: string) => pipe(
        state,
        E.fromPredicate(state => O.isNone(state),
            () => new Error(`Source code already registered`)),
        E.map(() => domainEvent(sourceCodeRegistered, uuidv4(), {name}, 0))
    )
}

export const sourceCode = eventStreamHandler(sourceCodeReducer, sourceCodeExecutor)


