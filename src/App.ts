import {EventBus, EventLog, InMemoryEventBus, InMemoryEventLog} from "./DomainEvent";
import {Value} from "./Value";
import {CommandBus, InMemoryCommandBus} from "./Command/CommandBus";
import {InMemoryQueryBus, QueryBus} from "./View/QueryBus";

export type App<D extends Value, C extends Value, Q extends Value, V extends Value> = {
    eventBus: EventBus
    eventLog: EventLog<D>
    commandBus: CommandBus<C, D>
    queryBus: QueryBus<Q, V>
}

export const App: <D extends Value, C extends Value, Q extends Value, V extends Value>() => App<D, C, Q, V> =
    <D extends Value, C extends Value, Q extends Value, V extends Value>() => {
        const eventBus = InMemoryEventBus<D>();
        const eventLog = InMemoryEventLog<D>([eventBus]);
        const commandBus = InMemoryCommandBus<C, D>();
        const queryBus = InMemoryQueryBus<Q, V>();
        return {
            eventBus,
            eventLog,
            commandBus,
            queryBus
        }
    }
