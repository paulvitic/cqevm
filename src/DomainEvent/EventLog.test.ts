import {domainEvent, DomainEvent} from "./DomainEvent";
import {v4 as uuidv4} from "uuid";
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import {sequenceT} from "fp-ts/Apply";
import * as assert from "assert";
import {Store} from "fp-ts/Store";
import {from, Observable} from "rxjs";


describe("", () => {
    const EVENT_TYPE = "EVENT_TYPE"
    //type EventType = { a: string }

    describe("", () => {
        it.skip("", async () => {
            const log: Array<DomainEvent> = []
            const append = (event: DomainEvent): TE.TaskEither<Error, void> =>
                TE.fromIO(() => {
                    log.push(event)
                })
            const fa = append(domainEvent(EVENT_TYPE, uuidv4(), {a: 'a'}))
            const fb = append(domainEvent(EVENT_TYPE, uuidv4(), {a: 'b'}))
            const fc = T.delay(10)(append(domainEvent(EVENT_TYPE, uuidv4(), {a: 'c'})))
            const fd = append(domainEvent(EVENT_TYPE, uuidv4(), {a: 'd'}))
            await sequenceT(T.task)(fa, fb, fc, fd)()
            assert.deepStrictEqual(log, ['a', 'b', 'd', 'c'])
        })
    })

    describe('', () => {
        type EventLog = Store<DomainEvent[], Observable<DomainEvent>>

        const InMemoryEventLog: () => EventLog = () => ({ peek: (pos: DomainEvent[]) => from(pos), pos: []})
    })
})


