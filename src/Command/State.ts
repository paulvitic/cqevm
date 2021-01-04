import {ValueObject} from "./ValueObject";
import {DomainEntity} from "./DomainEntity";
import {Value} from "../Value";
import {Option} from "fp-ts/Option";

export type State =
    Value
    | ValueObject
    | DomainEntity
    | StateObject
    | StateArray
    | Option<Value | ValueObject | DomainEntity | StateObject | StateArray>

interface StateObject {
    [key: string]: State
}

interface StateArray extends Array<State> { }

