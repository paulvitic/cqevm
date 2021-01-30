import {evaluate, execute, get, modify, put, State} from "fp-ts/State";
import {extract, peeks, seek, seeks, Store} from "fp-ts/Store";
import {flow, identity} from "fp-ts/function";
import {pipe} from "fp-ts/pipeable";

describe('', () => {
    type ViewModel = Record<string, { string: string, number: number, boolean: boolean }>
    type Repository<T, S = T> = Store<T, S>
    // Todo: How to include an IO? With Reader?
    interface Query<T> extends State<Store<T, T>, Store<T, T>> {}

    describe('repository', () => {
        const view: Repository<ViewModel> = { peek: identity, pos: {} }
        it('should create', function () {
            const create = (event: ViewModel) => pipe(
                put( //State
                    pipe(
                        view,
                        seek(event)) // Store
                    ),
                    execute(view), // State
                    extract // Store
                )

            const result = create({['a']: {string: 'a', number: 1, boolean: true}})
            expect(result).toStrictEqual({a: {string: 'a', number: 1, boolean: true}})
        });

        it('should read', function () {
            const read = () => pipe(
                get(),
                execute(view),
                extract
            )
            const result = read()
            expect(result).toStrictEqual({})
        });
    })

    describe('projection', () => {
        type Projection = Record<string, { string: string }>

        it('should project', function () {
            const project = (pos: Projection) => pos["a"].string
            const projection: Repository<Projection, string> = {peek: project, pos: {a: {string: "a"}}}
            expect(extract(execute(projection)(get()))).toStrictEqual('a')
        });
    })
})
