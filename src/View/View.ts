import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import {Value} from "../Value";
import {DomainEvent, EventListener} from "../DomainEvent";
import {Option} from "fp-ts/Option";
import {pipe} from "fp-ts/pipeable";
import {InMemoryRepository, Repository} from "./Repository";
import {Query} from "./Query";
import {QueryListener} from "./QueryBus";
import {Observable, Subscription, timer} from "rxjs";
import {map} from "rxjs/operators";
import {Processor} from "./Processor";
import {array} from "fp-ts";

/**
 * Test with
 *
 * @see: https://eventmodeling.org/posts/what-is-event-modeling/?s=09
 */
export type StateView<D extends Value, V extends Value> =
    (when: Observable<DomainEvent<D>>) => E.Either<Error, V>

export type ViewMutator<D extends Value = Value, V extends Value = Value> =
    (prev: Option<V>) => (when: DomainEvent<D>) => E.Either<Error, V>

export type QueryExecutor<Q extends Value, V extends Value> =
    (query: Query<Q>) => TE.TaskEither<Error, V>

export interface View<D extends Value, V extends Value, Q extends Value> extends EventListener<D>, QueryListener<Q, V> {
    addMutator(eventType: string, mutator: ViewMutator<D, V>): E.Either<Error, void>
    addExecutor(queryType: string, executor: QueryExecutor<Q, V>): E.Either<Error, void>
    addProcessor(frequency:number, processor: Processor<V>): E.Either<Error, void>
    get(): TE.TaskEither<Error, O.Option<V>>
    stopProcessors(): E.Either<Error, void>
}

export const view: <D extends Value, V extends Value, Q extends Value>(repository?: Repository<V>) => View<D, V, Q> =
    <D extends Value, V extends Value, Q extends Value>(repository: Repository<V>) => {

        const repo: Repository<V> = repository ? repository : InMemoryRepository()
        const mutators: {[eventType: string]: ViewMutator<any>} = {}
        const executors: {[queryType: string]: QueryExecutor<any, any>} = {}
        const processors: Subscription[] = []

        return {
            events: () => Object.keys(mutators),
            handleEvent: (event: DomainEvent<D>) =>
                pipe(
                    O.fromNullable(mutators[event.type]),
                    TE.fromOption(() => new Error("view mutator not found")),
                    TE.chain(mutator => pipe(
                        repo.get(),
                        TE.chain(prev => TE.fromEither(mutator(prev)(event))),
                        TE.chain(repo.set)
                        ),
                    )
                ),
            addMutator: (eventType: string, mutator: ViewMutator<D, V>) =>
                pipe(
                    mutator,
                    E.fromPredicate(
                        _m => O.isNone(O.fromNullable(mutators[eventType])),
                        () => new Error("mutator already exists")),
                    E.map(mutator => {
                        mutators[eventType] = mutator;
                    })
                ),
            get: () => repo.get(),
            queries: () => Object.keys(mutators),
            handleQuery: (query: Query<Q>) => pipe(
                O.fromNullable(executors[query.type]),
                TE.fromOption(() => new Error("query executor not found")),
                TE.chain(executor => pipe(
                    repo.get(),
                    TE.chain(() => executor(query)))
                )
            ),
            addExecutor: (queryType: string, executor: QueryExecutor<Q, V>) =>
                pipe(
                    executor,
                    E.fromPredicate(
                        _m => O.isNone(O.fromNullable(executors[queryType])),
                        () => new Error("executor already registered")),
                    E.map(executor => {
                        executors[queryType] = executor;
                    })
                ),
            addProcessor: (frequency: number, processor: Processor<V>) => E.tryCatch(() => {
                processors.push(timer(500, frequency)
                    .pipe(map(() => processor(repo.get())))
                        // filter( process => E.isRight(await process)))
                    .subscribe( async process => await process())
                )
            }, E.toError),
            stopProcessors: (): E.Either<Error, void> => E.tryCatch(() => {
                pipe(
                    processors,
                    array.traverse(E.either)(process => E.tryCatch(() => process.unsubscribe(), E.toError))
                )
            }, E.toError)
        }
    }

