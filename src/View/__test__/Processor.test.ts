import {view} from "../View";
import {InMemoryRepository, Repository} from "../Repository";
import {processor} from "../Processor";
import {Command, command} from "../../Command/Command";
import {DomainEvent, domainEvent, InMemoryEventBus, InMemoryEventLog} from "../../DomainEvent";
import {eventStreamHandler} from "../../Command/EventStreamHandler";
import * as O from "fp-ts/Option";
import {Aggregate} from "../../Command/Aggregate";
import * as E from "fp-ts/Either";
import {take, toArray} from "rxjs/operators";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/pipeable";
import {App} from "../../App";

describe("given", () => {
    const app = App()

    const PROCESS_TODO = "PROCESS_TODO"
    const CREATED = "CREATED"
    type CommandType = { a: string }
    type StateModel = { a : string }

    const STREAM_ID = 1234
    const stream = eventStreamHandler(app.eventLog)

    stream.executor(
        PROCESS_TODO,
        (command: Command<CommandType>) => (state: O.Option<Aggregate<StateModel>>) =>
            E.tryCatch(() => domainEvent(CREATED, STREAM_ID, {a : command.payload.a}, 0), E.toError)
    )
    app.commandBus.subscribe(stream)

    describe("given", () => {
        type ViewModel = { todo: {a: string}[] }

        const repo: Repository<ViewModel> = InMemoryRepository()
        const given = view(repo)

        describe("when", ()=> {
            const when = processor(app.commandBus, (view: O.Option<ViewModel>) => TE.tryCatch(
                () => Promise.resolve(pipe(
                    view,
                    O.map( view => command(PROCESS_TODO, { a: view.todo[0].a })))
                ), E.toError)
            )
            given.process(1000, when)

            it("then", async () => {

                await repo.update({todo: [{ a: "some todo"}]})()

                await new Promise<void>(resolve =>
                    setTimeout(() => resolve(), 1000));
                let loggedEvents: DomainEvent[] = []
                let stream = await app.eventLog.stream(STREAM_ID)()
                E.isRight(stream) && O.isSome(stream.right) && stream.right.value
                    .pipe(take(10), toArray())
                    .subscribe(res => loggedEvents = res)

                expect(loggedEvents.length).toBe(1)
                expect(loggedEvents[0].type).toBe(CREATED)

                given.stopProcessors()
            })
        })
    })
})
