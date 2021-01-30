import {extract, seeks, Store} from "fp-ts/Store";
import {execute, modify} from "fp-ts/State";
import {flow, identity} from "fp-ts/function";
import {pipe} from "fp-ts/pipeable";
import {domainEvent, DomainEvent} from "../DomainEvent";

describe('', () => {
    type ViewModel = Record<string, { string: string, number: number, boolean: boolean }>
    type View<T, S = T> = Store<T, S>
    // Todo: How to include an IO? With Reader?
    const view: <T>(pos: T) => View<T> = pos => { return { peek: identity, pos }}

    it('should modify', function () {
        type SomeEvent = {a:string}

        const mutateWhen = event => current => {
            return {
                ...current,
                a: {
                    ...current.a,
                    string: current.a.string + event.payload.a
                }
            }
        }

        const mutate = (view: View<ViewModel>) => (event: DomainEvent<SomeEvent>) => pipe(
            modify(flow(seeks(mutateWhen(event)))),
            execute(view),
            extract
        )

        const result = mutate(view({a: {string: "a", number:1, boolean:true}}))
            (domainEvent("someEvent",1234, {a: 'a'}))
        expect(result).toStrictEqual({a: {string: 'aa', number: 1, boolean: true}})
    });
})

describe('', () => {
    let MongoClient = require('mongodb').MongoClient;
    let url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        dbo.collection("customers").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
    });
})
