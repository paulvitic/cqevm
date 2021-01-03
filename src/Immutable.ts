/**
 * courtesy of Minko Gechev
 * see: https://t.co/JgNBZcB1YA?amp=1
 *
 */
interface ImmutableArray<T> extends ReadonlyArray<Immutable<T>> {}

type ImmutableObject<T> = {
    readonly [P in keyof T]: Immutable<T[P]>;
};

export type Immutable<T> =
    T extends (infer R)[] ? ImmutableArray<R> :
        T extends Function ? T :
            T extends object ? ImmutableObject<T> :
                T;
