import {Value} from "../Value";
import {Query} from "./Query";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";

export interface QueryListener<V extends Value> {
    queries: () => string[],
    handleQuery: (query: Query) => TE.TaskEither<Error, O.Option<V>>
}
