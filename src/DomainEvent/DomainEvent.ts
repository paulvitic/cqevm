import {Value} from "../Value";
import {Immutable} from "../Immutable";

export type DomainEvent<T extends Value = Value> = {
    readonly type: string
    readonly streamId: string | number,
    readonly sequence: number,
    readonly recordedOn: Date,
    readonly payload: Immutable<T>
}

export const domainEvent = <T extends Value>(
    type: string,
    streamId: string | number,
    payload: Immutable<T>,
    sequence?: number,
    recordedOn?: Date): DomainEvent<T> => ({
        type,
        streamId,
        payload,
        sequence: sequence ? sequence : 0,
        recordedOn: recordedOn ? recordedOn : new Date(Date.now()),
    })




