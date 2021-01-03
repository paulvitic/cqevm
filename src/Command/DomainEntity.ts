import {Identity} from "../Identity";
import {State} from "./State";

export type DomainEntity<T extends State> = T & Identity<T> & {
    readonly id: string | number
}

export const domainEntity = <T extends State = State>(id: string | number, state: T): DomainEntity<T> => ({
    id,
    ...state,
    equals: other => other.id === id,
    toString: () => JSON.stringify({id, ...state})
})
