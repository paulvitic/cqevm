import {Option} from "fp-ts/Option";

/**
 *
 */
export type Value = {
    readonly [ key: string ]:
        string | string[] |
        number | number[] |
        boolean | boolean[] |
        Value | Value[] |
        Option<string | number>
}

// see: https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
//const clone = require('rfdc')(); // really fast deep copy library
//let newState = clone(state);
