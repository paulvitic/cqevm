import {view} from "../../src/View/View";
import {pipe} from "fp-ts/pipeable";
import * as E from "fp-ts/Either";
import {fold} from "fp-ts/Option";
import {DomainEvent} from "../../src/DomainEvent";
import {sourceCodeRegistered, SourceCodeRegistered} from "./SourceCodeEvents";

export type SourceCodes = Record<string, {
    name: string
}>

export const sourceCodes = pipe(
    E.of(view<SourceCodes>()),
    E.chainFirst( view => view.mutateWhen(sourceCodeRegistered,
        from => (when: DomainEvent<SourceCodeRegistered>) => pipe(
            from,
            fold(() => E.right({ [when.streamId]:{name: when.payload.name} }),
            from => E.tryCatch(() => {
                from[when.streamId] = {name: when.payload.name}
                return from
            }, E.toError))
        )
    ))
)
