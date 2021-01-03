import {Value} from "../Value";
import {Immutable} from "../Immutable";

export type DomainEvent<T extends Value = Value> = Immutable<T> & {
    readonly type: string
    readonly streamId: string | number,
    readonly sequence: number,
    readonly recordedOn: number
}

export const domainEvent = <T extends Value = Value>(
    type: string,
    streamId: string | number,
    payload: Immutable<T>,
    sequence?: number,
    recordedOn?: Date,
    ): DomainEvent<T> => ({
        ...payload,
        type,
        streamId,
        sequence: sequence ? sequence : 0,
        recordedOn: recordedOn ? recordedOn.getTime() : new Date(Date.now()).getTime()
    })




