import {EventBus, EventLog, InMemoryEventBus, InMemoryEventLog} from "./DomainEvent";
import {Value} from "./Value";
import {CommandBus, InMemoryCommandBus} from "./Command/CommandBus";
import {InMemoryQueryBus, QueryBus} from "./View/QueryBus";

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
