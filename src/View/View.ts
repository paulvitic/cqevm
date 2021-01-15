import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import {Value} from "../Value";
import {DomainEvent, EventListener} from "../DomainEvent";
import {Option} from "fp-ts/Option";
import {pipe} from "fp-ts/pipeable";
import {InMemoryRepository, Repository} from "./Repository";
import {Query} from "./Query";
import {Subscription, timer} from "rxjs";
import {map} from "rxjs/operators";
import {Processor} from "./Processor";
import {array} from "fp-ts";
import {QueryListener} from "./QueryListener";

export type ViewMutator<V extends Value = Value> =
    (prev: Option<V>) => (when: DomainEvent) => E.Either<Error, V>

export type QueryExecutor<V extends Value> =
    (query: Query) => TE.TaskEither<Error, Option<V>>

export interface View<V extends Value> extends EventListener, QueryListener<V> {
    get(): TE.TaskEither<Error, O.Option<V>>
    mutateWhen(eventType: string, mutator: ViewMutator<V>): E.Either<Error, void>
    queryHandler(queryType: string, executor: QueryExecutor<V>): E.Either<Error, void>
    process(frequency: number, processor: Processor<V>): E.Either<Error, void>
    stopProcessors(): E.Either<Error, void>
}

export const view: <V extends Value>(repository?: Repository<V>) => View<V> =
    <V extends Value>(repository: Repository<V>) => {

        const repo: Repository<V> = repository ? repository : InMemoryRepository()
        const mutators: {[eventType: string]: ViewMutator<V>} = {}
        const executors: {[queryType: string]: QueryExecutor<V>} = {}
        const processors: Subscription[] = []

        return {
            events: () => Object.keys(mutators),
            handleEvent: (event: DomainEvent) =>
                pipe(
                    O.fromNullable(mutators[event.type]),
                    TE.fromOption(() => new Error("view mutator not found")),
                    TE.chain(mutate => pipe(
                        repo.peek(),
                        TE.chain(from => TE.fromEither(mutate(from)(event))),
                        TE.chain(repo.update))
                    )
                ),
            get: () => repo.peek(),
            mutateWhen: (eventType: string, mutator: ViewMutator<V>) =>
                pipe(
                    mutator,
                    E.fromPredicate(
                        _m => O.isNone(O.fromNullable(mutators[eventType])),
                        () => new Error("mutator already exists")),
                    E.map(mutator => {
                        mutators[eventType] = mutator;
                    })
                ),
            queries: () => Object.keys(mutators),
            handleQuery: (query: Query) => pipe(
                O.fromNullable(executors[query.type]),
                TE.fromOption(() => new Error("query executor not found")),
                TE.chain(executor => pipe(
                    repo.peek(),
                    TE.chain(() => executor(query)))
                )
            ),
            queryHandler: (queryType: string, executor: QueryExecutor<V>) =>
                pipe(
                    executor,
                    E.fromPredicate(
                        _m => O.isNone(O.fromNullable(executors[queryType])),
                        () => new Error("executor already registered")),
                    E.map(executor => {
                        executors[queryType] = executor;
                    })
                ),
            process: (frequency: number, processor: Processor<V>) => E.tryCatch(() => {
                processors.push(timer(500, frequency)
                    .pipe(map(() => processor(repo.peek())))
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

