import {InMemoryEventBus} from "../EventBus";
import {DomainEvent, domainEvent} from "../DomainEvent";
import * as E from "fp-ts/Either"
import * as O from "fp-ts/Option"
import {pipe} from "fp-ts/pipeable";
import {view} from "../../View/View";
import {InMemoryRepository, Repository} from "../../View/Repository";

describe("", () => {
    const eventBus = InMemoryEventBus()

    const CREATED = "CREATED"
    type Created = {
        a: string
    }

    const UPDATED = "UPDATED"
    type Updated = {
        a: string
    }

    // a view model
    type SomeTodo = { todo: {a: string}[] }

    const createdMutator = (prev: O.Option<SomeTodo>) => (event:DomainEvent<Created>)  => pipe(
        prev,
        O.fold(() => E.right({ todo: [{a: event.a}] } ),
            prev => E.tryCatch(
                () => ({ todo: prev.todo.concat([{ a: event.a}])}), E.toError)
        )
    )

    const updatedMutator = jest.fn(() => () => E.left(new Error("some error")))

    // a projection
    const repo: Repository<SomeTodo> = InMemoryRepository()
    const todoView = view(repo)
    todoView.addMutator(CREATED, createdMutator)
    todoView.addMutator(UPDATED, updatedMutator)

    it("", async () => {
        eventBus.subscribe(todoView)
        const created: DomainEvent<Created> = domainEvent(
            CREATED,
            123,
            {a: "some value"}
        )
        let createdOut = await eventBus.dispatch(created)()
        expect(E.right(createdOut)).toBeTruthy()

        let wait = new Promise<void>(resolve =>
            setTimeout(() => resolve(), 1000));
        await wait
        let mutatedView = await todoView.get()()
        let res = E.isRight(mutatedView) && O.isSome(mutatedView.right) && mutatedView.right.value
        expect(res.todo.length).toBe(1)

        createdOut = await eventBus.dispatch(created)()
        expect(E.right(createdOut)).toBeTruthy()

        await new Promise<void>(resolve =>
            setTimeout(() => resolve(), 1000));
        mutatedView = await todoView.get()()
        res = E.isRight(mutatedView) && O.isSome(mutatedView.right) && mutatedView.right.value
        expect(res.todo.length).toBe(2)

        const updated: DomainEvent<Updated> = domainEvent(
            UPDATED,
            123,
            {a: "updated value"}
        )
        let updatedOut = await eventBus.dispatch(updated)()
        expect(E.right(updatedOut)).toBeTruthy()

        await new Promise<void>(resolve =>
            setTimeout(() => resolve(), 1000));
        mutatedView = await todoView.get()()
        res = E.isRight(mutatedView) && O.isSome(mutatedView.right) && mutatedView.right.value
        expect(res.todo.length).toBe(2)

        expect(updatedMutator).toBeCalledTimes(1)

        createdOut = await eventBus.dispatch(created)()
        expect(E.right(createdOut)).toBeTruthy()

        await new Promise<void>(resolve =>
            setTimeout(() => resolve(), 1000));
        mutatedView = await todoView.get()()
        res = E.isRight(mutatedView) && O.isSome(mutatedView.right) && mutatedView.right.value
        expect(res.todo.length).toBe(3)
    })
})
