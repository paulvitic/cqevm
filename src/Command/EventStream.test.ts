import * as O from "fp-ts/Option"
import * as E from "fp-ts/Either"
import * as TE from "fp-ts/TaskEither";
import {DomainEvent, domainEvent} from "../DomainEvent";
import {from, Observable} from "rxjs";
import {
    reduceWith,
    stateOf,
    CommandExecutor,
    EventStream,
    StreamReducer,
    StreamState,
    eventStream
} from "./EventStream";
import {pipe} from "fp-ts/pipeable";
import {flow} from "fp-ts/function";

describe("given", () => {
    // type TestState = {
    //     a: string,
    //     b: O.Option<ValueObject<{c: boolean, d: number}>>
    //     d: O.Option<DomainEntity<{e: number}>>
    // }
    //
    // const STREAM_ID = 1234
    //
    // const CREATED_EVENT = "CREATED_EVENT"
    // type CreatedEvent = { a: string }
    //
    // const UPDATED_EVENT = "UPDATED_EVENT"
    //
    // type UPDATED_EVENT = { a: string }
    //
    // let given = from([
    //     domainEvent(CREATED_EVENT, STREAM_ID, {a: "initial value"})
    // ])

    /*describe("when", () => {
        const when = eventStream()
        when.reducerFor(CREATED_EVENT,
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

        when.executor(EXECUTE_UPDATE_COMMAND,
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
                when.reduce(given),
                E.map( aggregate => pipe(
                    when.bind(EXECUTE_UPDATE_COMMAND),
                    E.fromOption(() => new Error()),
                    E.map( executor => executor("")(aggregate)),
                    E.flatten
                )),
                E.flatten
            )

            expect(E.isRight(then) && then.right.type).toBe(UPDATED_EVENT)
        })
    })*/
})

describe('select', function () {
    type SomeState = {a: number, b: number}
    const STREAM_ID = 1234

    const when = from([
        domainEvent("created", STREAM_ID, { a:1, b:1 }),
        domainEvent("aIncremented", STREAM_ID, 2, 1),
        domainEvent("aIncremented", STREAM_ID, 3, 2)
    ])

    describe('', function () {
        const testReducer: StreamReducer<SomeState> = {
            created: (previous, event:DomainEvent<{ a: number, b: number }>) => E.right(
                O.some(stateOf(STREAM_ID, {a: event.payload.a, b: event.payload.b}))
            ),
            aIncremented: (previous, event:DomainEvent<number>) => pipe(
                previous,
                E.chain(E.fromOption(() => new Error(`previous state can not be null`))),
                E.map(previous => O.some(stateOf(previous.id,
                    { ...previous.state, a: previous.state.a + event.payload}, event.sequence))
                )
            )
        }

        it('should ', async () => {
            let then = await reduceWith(testReducer)(when)()
            let result = E.isRight(then) && O.isSome(then.right) && then.right.value;
            expect(result.playHead).toBe(2)
            expect(result.state.a).toBe(6)
        });

        describe('', ()=> {
            const testExecutor: EventStream<SomeState> = {
                incrementB: (state) => (increment: number) => pipe(
                    state,
                    TE.chain(flow(
                        O.map(state => state.state.b > 5 ?
                            TE.left(new Error('b can not be further incremented')) :
                            TE.right(domainEvent("bUpdated", state.id,
                            state.state.b + increment, state.playHead + 1))
                        ),
                        O.getOrElse(() => TE.left(new Error('can not increment on a empty state')))
                    ))
                )
            }

            it('should ', async () => {
                let then = await eventStream(testReducer, testExecutor).incrementB(when)(4)()
                let result = E.isRight(then) && then.right;
                expect(result.type).toBe("bUpdated")
                expect(result.sequence).toBe(3)
                expect(result.payload).toBe(5)
            });
        })
    });
});

describe('lookup', () => {

    /*const select = (rec: Record<string, (a:number) => number>) => (s: {key: string, value: number}) =>
        ap(some(s.value))(lookup(s.key, rec))

    const rec = {
        a: a => a + 1,
        b: a => a + 2
    }*/

    test.skip('', () => {
        /*const reduce = select(rec)
        let res = reduce({key:'b', value: 2})
        expect(isSome(res) && res.value).toBe(4)*/
    })

    it.skip('map', () => {
        /*const fc = (rec: Record<string, (a:number) => number>) =>
            (fa: Observable<{key: string, value: number}>) => observable.map(
                fa,
                (s: {key: string, value: number}) => ap(some(s.value))(lookup(s.key, rec)))
        const stream = fc(rec)
        const fb = stream(from([{key:'b', value: 2}, {key:'a', value: 2}]))
        return fb
            .pipe(bufferTime(10))
            .toPromise()
            .then(events => {
                assert.deepStrictEqual(events, [2, 4, 6])
            })*/
    })

    it.skip('reduce', async () => {
        /*type Event = { key: string, value: number }
        type Accumulator = (acc:number, event: DomainEvent) => number
        type Reducer = Record<string, Accumulator>

        const using = (red: Reducer) => (acc, event) =>
            getOrElse(() => (acc, _) => acc)(lookup(event.type, red))(acc, event)

        const reducer = {
            a: (acc, event) => acc + event.value + 1,
            b: (acc, event) => acc + event.value + 2
        }

        const input = from([
            {key:'b', value: 2},
            {key:'a', value: 2},
            {key:'c', value: 1}
        ])

        const fc = tryCatch(() => input.pipe(reduce(using(reducer),0)).toPromise(), toError)
        let res = await fc()
        expect(isRight(res) && res.right).toBe(7)*/
    })
})
