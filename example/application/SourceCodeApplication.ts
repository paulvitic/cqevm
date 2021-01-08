import {EXECUTE_REGISTER_SOURCE_CODE, sourceCode} from "../domain/SourceCode";
import * as O from "fp-ts/Option";
import {Command} from "../../src/Command/Command";
import * as E from "fp-ts/Either";
import {pipe} from "fp-ts/pipeable";
import {commandListener} from "../../src/Command/CommandListener";

//////////////////////
// Commands
/////////////////////
export const REGISTER_SOURCE_CODE = "REGISTER_SOURCE_CODE"
export type RegisterSourceCode = { name: string }

export const RECORD_HEROKU_DEPLOYMENT_REPORT_SOURCE = "RECORD_HEROKU_DEPLOYMENT_REPORT_SOURCE"
export type HerokuDeploymentReportSource = {
        herokuAppName: string
        lastDeployedVersion: number
}

//////////////////////
// Application
/////////////////////
export const sourceCodeApplication = pipe(
    sourceCode,
    E.map(sourceCode => pipe(
        E.right(commandListener()),
        E.chainFirst( listener => listener.bindExecutor(
            REGISTER_SOURCE_CODE,
            (command: Command<RegisterSourceCode>) => [command.payload.name],
            sourceCode, EXECUTE_REGISTER_SOURCE_CODE)
        )
    ))
)
