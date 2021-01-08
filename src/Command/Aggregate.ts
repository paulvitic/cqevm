import {State} from "./State";
import {DomainEntity} from "./DomainEntity";

export interface Aggregate<T extends State> extends DomainEntity<T> {
    readonly playHead: number
}

export const aggregate = <T extends State>(
    id: string | number,
    state: T,
    playHead?: number): Aggregate<T> => ({
        id,
        playHead: playHead ? playHead : 0,
        state,
        equals: other => other.id === id,
        toString: () => JSON.stringify({id, playHead, state})
    })
