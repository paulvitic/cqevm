import {State, put, get, execute} from "fp-ts/State";
import {Store, extract} from "fp-ts/Store";
import {identity} from "fp-ts/function";
import {} from "fp-ts/es6/Store";

describe('', () => {
    type Repository<T, S = T> = Store<T, S>
    interface Query<T> extends State<Store<T, T>, Store<T, T>> {}

    it('should project', function () {
        type View = Record<string, {string: string}>
        const project = (pos: View) => pos["a"].string
        const projection: Repository<View, string> =  { peek: project, pos: {a:{string:"a"}} }
        expect(extract(execute(projection)(get()))).toStrictEqual('a')
    });

    it('should get', function () {
        type View = Record<string,{string: string, number: number, boolean: boolean}>
        const repo: Repository<View> = { peek: identity, pos: {} }
        const getQuery = execute(repo)(get())
        expect(getQuery).toBe(repo)
        const queryResult = extract(getQuery)
        expect(queryResult).toStrictEqual({})
    });

    it('should put', function () {
        type View = Record<string,{string: string, number: number, boolean: boolean}>
        const repo: Repository<View> = { peek: identity, pos: {} }
        const putQuery = execute(repo)(put({ peek: identity, pos: {['a']: {string:'a', number:1, boolean:true} }}))
        const queryResult = extract(putQuery)
        expect(queryResult).toStrictEqual({a: {string:'a', number:1, boolean:true}})
    });

    it('should ', function () {

    });

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
