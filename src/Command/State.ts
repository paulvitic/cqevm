import {Option} from "fp-ts/Option";
import {ValueObject} from "./ValueObject";
import {DomainEntity} from "./DomainEntity";

export type State = {
    readonly [ key: string ]:
        string | Option<string> | string[] | Option<string[]> |
        number | Option<number> | number[] | Option<number[]> |
        boolean | Option<boolean> | boolean[] | Option<boolean[]> |
        ValueObject<any> | Option<ValueObject<any>> | ValueObject<any>[] | Option<ValueObject<any>[]> |
        DomainEntity<any> | Option<DomainEntity<any>> | DomainEntity<any>[] | Option<DomainEntity<any>[]> |
        State | Option<State> | State[] | Option<State[]>
}
