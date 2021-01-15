import {fold, Monoid, monoidString} from "fp-ts/Monoid";

// How to write type class instances for your data type
// See: https://gcanti.github.io/fp-ts/guides/HKT.html

describe('', () => {
   /* it('', () => {
        //see: https://github.com/gcanti/fp-ts/issues/395
        const URI = 'Tree'
        //define your Tree structure for items of type A
        type Tree<A> = {}
        //define your Data type
        type Data = object | Array<any>
        //define `reduce` implementation for your Tree - this is the instance of Foldable for Tree
        const tree: Foldable1<URI> = {
            foldMap,
            reduce,
            reduceRight,
            URI
        }
        //define `concat` and `empty` for your Data - this is the instance of Monoid for Data
        const monoidData: Monoid<Data> = {
            concat,
            empty
        }
        //single tree
        const foo: Tree<Data> = {}
        //fold is imported from Foldable
        const result = fold(monoidData)([foo]) //this is the result based on `reduce` implementation for Tree and `concat`/`empty` implementation for Data

    })*/

    it("", () => {
        type Data = object | Array<any> | string
        const monoidData: Monoid<Data> = {
            concat: (a, b) => {
                //here you need to check the types of a and b at runtime (statically the type is Data)
                //and define the logic of concatenation of objects and arrays
                //for example:
                return JSON.stringify(a) + JSON.stringify(b)
            },
            //starting element
            empty: () => '' //string for stringified JSON concatenation
        }
        const res = fold(monoidData)([[1, 2, 3], {foo: 'bar'}])
        expect(res).toEqual('')
    })

    it('', () => {
        const res = fold(monoidString)(['a', 'b', 'c'])
        expect(res).toEqual('')
    })
})
