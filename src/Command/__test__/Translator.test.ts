import {DomainEvent, domainEvent} from "../../DomainEvent";
import {eventStream} from "../EventStream";
import {command, Command} from "../Command";
import * as O from "fp-ts/Option";
import {Aggregate} from "../Aggregate";
import * as E from "fp-ts/Either";
import {translator} from "../Translator";
import {take, toArray} from "rxjs/operators";
import {App} from "../../App";

describe("given", () => {
    const app = App()

    // command model
    const PROCESS_TODO = "PROCESS_TODO"
    type CommandType = { a: string }

    // incoming domain event model
    const CREATED = "CREATED"
    type CreatedType = { a: string}

    const UPDATED = "UPDATED"
    type Updated = { a: string}

    type StateModel = { a : string }

    const STREAM_ID = 1234
    const stream = eventStream()
    stream.executor(
        PROCESS_TODO,
        (command: Command<CommandType>) => (state: O.Option<Aggregate<StateModel>>) =>
            E.tryCatch(() => domainEvent(UPDATED, STREAM_ID, {a : command.payload.a}, 0), E.toError)
    )
    app.commandBus.subscribe(stream)

    const given = domainEvent(CREATED, STREAM_ID, {a: "some value"})

    describe("when", () => {
        const when = translator(app.commandBus)
        when.addTranslation(CREATED, (event: DomainEvent<CreatedType>) => E.tryCatch(() =>
                    O.some(command(PROCESS_TODO, {a: event.payload.a}, event.streamId))
                , E.toError))
        app.eventBus.subscribe(when)

        it("then", async () => {
            await app.eventBus.dispatch(given)()

            await new Promise<void>(resolve =>
                setTimeout(() => resolve(), 1000));
            let loggedEvents: DomainEvent[] = []
            const stream = await app.eventLog.stream(STREAM_ID)()
            E.isRight(stream) && O.isSome(stream.right) && stream.right.value
                .pipe(take(10), toArray())
                .subscribe(events => {loggedEvents = events})
            expect(loggedEvents.length).toBe(1)
            expect(loggedEvents[0].type).toBe(UPDATED)
        })
    })
})
