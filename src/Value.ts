
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

// see: https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
//const clone = require('rfdc')(); // really fast deep copy library
//let newState = clone(state);
