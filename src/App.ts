import {EventBus, EventLog, InMemoryEventBus, InMemoryEventLog} from "./DomainEvent";
import {Value} from "./Value";
import {CommandBus, InMemoryCommandBus} from "./Command/CommandBus";
import {InMemoryQueryBus, QueryBus} from "./View/QueryBus";

// CQRS eventBus command query event types using io etc.
// See: https://docs.marblejs.com/messaging/cqrs

// Why use io-ts
// see: https://www.azavea.com/blog/2020/10/29/run-time-type-checking-in-typescript-with-io-ts
// see; https://www.puzzle.ch/de/blog/articles/2019/09/25/data-contracts-and-transformations-with-io-ts
// see: https://dev.to/remojansen/data-fetching-in-react-the-functional-way-powered-by-typescript-io-ts--fp-ts-ojf

export type App<D extends Value, C extends Value, Q extends Value, V extends Value> = {
    eventBus: EventBus
    eventLog: EventLog
    commandBus: CommandBus
    queryBus: QueryBus<Q, V>
}

export const App: <D extends Value, C extends Value, Q extends Value, V extends Value>() => App<D, C, Q, V> =
    <D extends Value, C extends Value, Q extends Value, V extends Value>() => {
        const eventBus = InMemoryEventBus();
        const eventLog = InMemoryEventLog([eventBus]);
        const commandBus = InMemoryCommandBus(eventLog);
        const queryBus = InMemoryQueryBus<Q, V>();
        return {
            eventBus,
            eventLog,
            commandBus,
            queryBus
        }
    }
