import {Identity} from "./Identity";
import {State} from "./State";

export interface DomainEntity<T extends State = State> extends Identity<DomainEntity<T>> {
    readonly id: string | number
    state: T
}

export const domainEntity = <T extends State>(id: string | number, state: T): DomainEntity<T> => ({
    id,
    state,
    equals: other => other.id === id,
    toString: () => JSON.stringify({id, state})
})
