import * as O from "fp-ts/Option";
import {ValueObject} from "./ValueObject";
import {domainEntity, DomainEntity} from "./DomainEntity";
import {aggregate, Aggregate} from "./Aggregate";

it("", () => {
    type TestState = {
        a: string,
        b: O.Option<ValueObject<{c: boolean, d: number}>>
        d: O.Option<DomainEntity<{e: number}>>
    }

    const testAggregate: Aggregate<TestState> =
        aggregate(1234,
            {
                a: "",
                b: O.none,
                d: O.some(domainEntity(456, {e:1}))
            })

    expect(testAggregate.playHead).toBe(0)
})

