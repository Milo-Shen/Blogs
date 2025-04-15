// 对 Array 加载遍历器 （ 原始方式 ）
let makeIterator = array => {
    let nextIndex = 0;
    return {
        next: function () {
            return nextIndex < array.length ?
                {value: array[nextIndex++], done: false} :
                {value: undefined, done: true}
        }
    }
};

// // 可以简写
// let makeIterator = array => {
//     let nextIndex = 0;
//     return {
//         ['next'] () {
//             return nextIndex < array.length ?
//                 {value: array[nextIndex++], done: false} :
//                 {value: undefined, done: true}
//         }
//     }
// };

let it = makeIterator(['a', 'b']);

console.log(it.next());
console.log(it.next());
console.log(it.next());

