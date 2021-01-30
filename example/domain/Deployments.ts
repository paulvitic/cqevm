import {fold, map} from "fp-ts/Option";
import {pipe} from "fp-ts/pipeable";
import * as E from "fp-ts/Either";
import {view} from "../../src/View/View";
import {DomainEvent} from "../../src/DomainEvent";
import {array} from "fp-ts";
import {
    deploymentReportSourceRecorded,
    DeploymentReportSourceRecorded,
    deploymentsCounted,
    DeploymentsCounted
} from "./SourceCodeEvents";

export type Deployments = Array<{
    sourceCodeId: string,
    date: number
    count?: number
}>

export const deployments = pipe(
    E.of(view<Deployments>()),

    E.chainFirst( view => view.mutateWhen(deploymentReportSourceRecorded,
        from => (when: DomainEvent<DeploymentReportSourceRecorded>) => pipe(
            from,
            fold(() => E.right(
                [{sourceCodeId: when.streamId.toString(), date: when.payload.nextReportDate}]
                ),from => E.tryCatch(() => from.concat(
                    [{sourceCodeId: when.streamId.toString(), date: when.payload.nextReportDate}]
                ), E.toError))
        )
    )),

    E.chainFirst( view => view.mutateWhen(deploymentsCounted,
        from => (when: DomainEvent<DeploymentsCounted>) => pipe(
            from,
            fold(() => E.left(new Error("no report to record")), // fixme: too strict?
                from => E.tryCatch(() => {
                    pipe(
                        from,
                        array.findFirst( report =>
                            report.sourceCodeId === when.streamId as string && report.date=== when.payload.reportDate),
                        map( report => report.count = when.payload.count)
                    )
                    return from.concat(
                        [{sourceCodeId: when.streamId.toString(), date: when.payload.nextReportDate}]
                    )
                }, E.toError)
            )
        )
    )),
)
