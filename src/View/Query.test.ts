import {execute, get, put, State} from "fp-ts/State";
import {extract, seek, Store} from "fp-ts/Store";
import {identity} from "fp-ts/function";
import {pipe} from "fp-ts/pipeable";

describe('', () => {
    type Repository<T, S = T> = Store<T, S>
    interface Query<T> extends State<Store<T, T>, Store<T, T>> {}

    describe('repository', () => {
        type View = Record<string,{string: string, number: number, boolean: boolean}>

        it('should create', function () {
            // Todo: How to include an IO? With Reader?
            const repo: Repository<View> = { peek: identity, pos: {} }

            //const putQuery = (a: View) => execute(repo)(put(pipe(repo, seek(a))))
            /*const putQuery = (create: View) => pipe(
                put(pipe(
                    repo,
                    seek(create))),
                execute(repo)
            )*/
            const create = (initial: View) => pipe(
                pipe(put( //State
                    pipe(
                        repo,
                        seek(initial)) // Store
                    ),
                    execute(repo), // State
                    extract // Store
                )
            )
            const result = create({['a']: {string:'a', number:1, boolean:true} })
            expect(result).toStrictEqual({a: {string:'a', number:1, boolean:true}})
        });

        it('should read', function () {
            const repo: Repository<View> = { peek: identity, pos: {} }
            //const getQuery = () => execute(repo)(get())
            //expect(getQuery).toBe(repo)
            const read = () => pipe(
                pipe(get(),
                    execute(repo),
                    extract
                )
            )

            const result = read()
            expect(result).toStrictEqual({})
        });

        it('should update', function () {

        });
    })

    describe('projection', () => {
        it('should project', function () {
            type Projection = Record<string, {string: string}>
            const project = (pos: Projection) => pos["a"].string
            const projection: Repository<Projection, string> =  { peek: project, pos: {a:{string:"a"}} }
            expect(extract(execute(projection)(get()))).toStrictEqual('a')
        });
    })

    it.skip('should ', function () {

        /*const eventLog: (eventStore: EventStore) => EventLog<any> =
            (eventStore) => ({
                append: (event: DomainEvent) => pipe(eventStore, STR.seeks(s => s.concat(event))),
                stream: (streamId: string | number) => STR.extract(eventStore)
            })

        eventLog = pipe(
            eventLog,
            seeks(s => s.concat(domainEvent(EVENT_TYPE, uuidv4(), {a: 'a'}))),
            seeks(s => s.concat(domainEvent(EVENT_TYPE, uuidv4(), {a: 'b'}))),
        )

        let observable1 = extract(eventLog)

        let res1 = []
        let subscription1 = observable1.subscribe(out => res1.push(out))
        expect(res1.length).toBe(2)
        subscription1.unsubscribe()

        eventLog = pipe(
            eventLog,
            seeks(s => s.concat(domainEvent(EVENT_TYPE, uuidv4(), {a: 'c'}))),
            seeks(s => s.concat(domainEvent(EVENT_TYPE, uuidv4(), {a: 'd'}))),
            //STR.extract
        )

        let res2 = []
        let observable2 = extract(eventLog)
        let subscription2 = observable2.subscribe(out => res2.push(out))
        expect(res2.length).toBe(4)
        //T.delay(10)(T.of(expect(res.length).toBe(2)))
        subscription2.unsubscribe()*/
    });

})
