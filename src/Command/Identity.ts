
export interface Identity<T> {
    equals(other: T): boolean;
    toString(): string
}
