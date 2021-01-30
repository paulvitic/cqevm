import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/pipeable";

type State = {prop: string}
type FetchErr = { tag: 'FetchErr', reason: unknown }
type DecodeErr = { tag: 'DecodeErr', reason: string }
type FetchState = (input: RequestInfo, init?: RequestInit) => TE.TaskEither<Error, unknown>
type DecodeState = (data: unknown) => E.Either<Error, State>
type RetrieveState = (serverUrl: string, catId: string) => TE.TaskEither<Error, State>

const fetchState: FetchState = (input: RequestInfo, init?: RequestInit) =>
    TE.tryCatch(() => fetch(input), E.toError)

const decodeState: DecodeState = (data: unknown) =>
    E.tryCatch(() => ({prop: data as string}), E.toError)

const retrieveState: RetrieveState = (serverUrl: string, catId: string) => pipe(
    fetchState(serverUrl),
    TE.chain(res => TE.fromEither(decodeState(res)))
)

