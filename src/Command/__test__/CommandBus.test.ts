import {App} from "../../App";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

import {domainEvent, DomainEvent} from "../../DomainEvent";
import {command} from "../Command";

describe("given", ()=> {
    const app = App()

    const COMMAND_A = "COMMAND_A"
    const COMMAND_B = "COMMAND_B"

    const EVENT_A = "EVENT_A"
    const EVENT_B = "EVENT_B"

    app.commandBus.subscribe({
        commands: () => [COMMAND_A],
        handleCommand: command => TE.tryCatch(() => new Promise<DomainEvent>( async resolve => {
            let event = domainEvent(EVENT_A, 123, {})
            await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
            resolve(event)
            }), E.toError)
    })

    app.commandBus.subscribe({
        commands: () => [COMMAND_B],
        handleCommand: command => TE.tryCatch(() => new Promise<DomainEvent>( async resolve => {
            resolve(domainEvent(EVENT_B, 345, {}))
        }), E.toError)
    })

    it('Can register a command handler', async () => {

        let eventA = await app.commandBus.dispatch(command(COMMAND_A, {}))()
        let eventB = await app.commandBus.dispatch(command(COMMAND_B, {}))()

        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
        expect(E.isRight(eventA) && eventA.right.type).toBe(EVENT_A)
        expect(E.isRight(eventB) && eventB.right.type).toBe(EVENT_B)
    })
})
