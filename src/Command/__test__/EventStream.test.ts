import * as E from "fp-ts/Either"
import * as O from "fp-ts/Option"
import {domainEvent, DomainEvent} from "../../DomainEvent";
import {eventStream} from "../EventStream";
import {ValueObject} from "../ValueObject";
import {DomainEntity} from "../DomainEntity";
import {pipe} from "fp-ts/pipeable";
import {Command, command} from "../Command";
import {take, toArray} from "rxjs/operators";
import {Aggregate, aggregate} from "../Aggregate";
import {App} from "../../App";
import {Option} from "fp-ts/Option";

describe("given", () => {
    const app = App();

    const STREAM_ID = 1234

    const CREATED_EVENT = "CREATED_EVENT"
    type CreatedEvent = { a: string }

    const UPDATED_EVENT = "UPDATED_EVENT"
    type UPDATED_EVENT = { a: string }

    describe("when", () => {
        type TestState = {
            a: string,
            b: O.Option<ValueObject<{c: boolean, d: number}>>
            d: O.Option<DomainEntity<{e: number}>>
        }

        const when = eventStream(app.eventLog)
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

        const UPDATE_COMMAND = "UPDATE_COMMAND"
        type CreateCommand = { prop: string}

        when.addExecutor(UPDATE_COMMAND,
            (command: Command<CreateCommand>) => state =>
                pipe(
                    state,
                    E.fromOption(() => new Error("no state to update")),
                    E.chain( previous => E.right(
                        domainEvent(
                            UPDATED_EVENT,
                            STREAM_ID,
                            {a: command.payload.prop},
                            previous.playHead + 1)
                        )
                    )
                ))

        app.commandBus.subscribe(when)

        it("then", async () => {
            await app.eventLog.append(domainEvent(CREATED_EVENT, STREAM_ID, {a: "initial value"}))()

            await app.commandBus.dispatch(command(UPDATE_COMMAND, {prop: "update value"}, STREAM_ID))()

            await new Promise<void>(resolve =>
                setTimeout(() => resolve(), 1000));
            let loggedEvents: DomainEvent[] = []
            let stream = await app.eventLog.stream(STREAM_ID)()
            E.isRight(stream) && O.isSome(stream.right) && stream.right.value
                .pipe(take(10), toArray())
                .subscribe(res => loggedEvents = res)

            expect(loggedEvents.length).toBe(2)
            expect(loggedEvents[0].type).toBe(CREATED_EVENT)
        })
    })
})

describe("test stream", () => {
    /*testStream.addExecutor(CREATE_COMMAND,
            (command: Command<CreateCommand>) => state =>
                pipe(
                    state,
                    O.fold(() => E.tryCatch(() => domainEvent(
                        CREATED_EVENT,
                        1234,
                        {a: command.prop}), E.toError),
                        _prev => E.left(new Error('already created'))
                    )
                ))*/
})
