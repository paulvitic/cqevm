import {sourceCode} from "../domain/SourceCode";
import {command, Command} from "../../src/Command/Command";
import * as E from "fp-ts/Either";
import * as RE from "fp-ts/Reader";

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
    RE.of(commandListener()),
    RE.map(listener => listener.bindExecutor(REGISTER_SOURCE_CODE, sourceCode, "registerSourceCode",
        (command: Command<RegisterSourceCode>) => [command.payload.name])),
    RE.compose
)
