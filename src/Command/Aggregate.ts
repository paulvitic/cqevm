import {State} from "./State";
import {Identity} from "../Identity";

export type Aggregate<T extends State> = T & Identity<Aggregate<T>> & {
    readonly id: string | number
    readonly playHead: number
}

export const aggregate = <T extends State>(
    id: string | number,
    state: T,
    playHead?: number): Aggregate<T> => ({
    id,
    playHead: playHead ? playHead : 0,
    ...state,
    equals: other => other.id === id,
    toString: () => JSON.stringify({id, playHead: playHead ? playHead : 0, ...state}),
})
