import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Reader";
import {Observable} from "rxjs";

type View = {a: string, b:number, c:boolean}
type Something = (repo: R.Reader<View, View>) =>
    (eventStream: Observable<any>) => void
