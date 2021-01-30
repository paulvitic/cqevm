// see: https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
//const clone = require('rfdc')(); // really fast deep copy library
//let newState = clone(state);

// TODO consider using io-ts
// see; https://github.com/gcanti/io-ts/issues/50
/**
 *
 */
export type Value =
    string
    | number
    | boolean
    | NoFunctionObject
    | NoFunctionArray

interface NoFunctionObject {
    [key: string]: Value
}

interface NoFunctionArray extends Array<Value|NoFunctionObject> { }


