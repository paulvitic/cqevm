export const sourceCodeRegistered = "sourceCodeRegistered"
export type SourceCodeRegistered = {
    name: string
}

export const deploymentReportSourceRecorded = "deploymentReportSourceRecorded"
export type DeploymentReportSourceRecorded = {
    nextReportDate: number
}

export const deploymentsCounted = "deploymentsCounted"
export type DeploymentsCounted = {
    reportDate: number
    count: number
    nextReportDate: number
}
