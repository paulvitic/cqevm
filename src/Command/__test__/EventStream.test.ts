import * as E from "fp-ts/Either"
import * as O from "fp-ts/Option"
import {domainEvent, DomainEvent} from "../../DomainEvent";
import {eventStream} from "../EventStream";
import {ValueObject} from "../ValueObject";
import {DomainEntity} from "../DomainEntity";
import {pipe} from "fp-ts/pipeable";
import {Aggregate, aggregate} from "../Aggregate";
import {Option} from "fp-ts/Option";
import {from} from "rxjs";

describe("given", () => {

    const STREAM_ID = 1234

    const CREATED_EVENT = "CREATED_EVENT"
    type CreatedEvent = { a: string }

    const UPDATED_EVENT = "UPDATED_EVENT"
    //type UPDATED_EVENT = { a: string }

    let given = from([
        domainEvent(CREATED_EVENT, STREAM_ID, {a: "initial value"})
    ])

    describe("when", () => {
        type TestState = {
            a: string,
            b: O.Option<ValueObject<{c: boolean, d: number}>>
            d: O.Option<DomainEntity<{e: number}>>
        }

        const when = eventStream()
        when.addReducer(CREATED_EVENT,
            (event: DomainEvent<CreatedEvent>) => (state: Option<Aggregate<TestState>>) =>
                pipe(
                    state,
                    O.fromPredicate(O.isNone),
                    E.fromOption(() => new Error("already created")),
                    E.chain( () => E.tryCatch(() => aggregate(
                        event.streamId,
                        {a: event.payload.a, b: O.none, d: O.none},
                        event.sequence), E.toError)
                    )
                ))

        const EXECUTE_UPDATE_COMMAND = "UPDATE_COMMAND"

        when.addExecutor(EXECUTE_UPDATE_COMMAND,
            (prop: string) => state =>
                pipe(
                    state,
                    E.fromOption(() => new Error("no state to update")),
                    E.chain( previous => E.right(
                        domainEvent(
                            UPDATED_EVENT,
                            STREAM_ID,
                            {a: prop},
                            previous.playHead + 1)
                        )
                    )
                ))

        it("then", async () => {
            let then = pipe(
                when.aggregate(given),
                E.map( aggregate => pipe(
                    when.executor(EXECUTE_UPDATE_COMMAND),
                    E.fromOption(() => new Error()),
                    E.map( executor => executor("")(aggregate)),
                    E.flatten
                )),
                E.flatten
            )

            expect(E.isRight(then) && then.right.type).toBe(UPDATED_EVENT)
        })
    })
})
