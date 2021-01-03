// import * as E from "fp-ts/Either"
// import {toArray} from "rxjs/operators";

describe('InMemoryEventStore', () => {
    const date = new Date();
    date.setTime(1535183762);

    it('Throws an exception loading an unknown event stream', async () => {
        /*const repository = InMemoryEventStore();
        const id = ScalarIdentity('38459347598437');
        let res = await repository.load(id)();
        expect(E.isLeft(res)).toBeTruthy()*/
    });

    it('Can append domain event', async () => {
        /*const repository = InMemoryEventStore();
        const id = ScalarIdentity('38459347598437');
        const domainEvent = {type: "testEvent"};
        const event = DomainMessageFactory(id, 0, domainEvent, date);
        const eventStream = DomainEventStreamFactory([event]);
        await repository.append(id, eventStream);
        const res = await repository.load(id)()
        expect(E.isRight(res) && res.right.pipe(toArray()).toPromise()).toEqual([event]);*/
    });
});
