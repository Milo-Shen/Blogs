// nodeJs 8.3.0 不支持 yield 表达式 !

function* f(x) {
    let y = yield(x + 1);
    let z = yield (y / 3);
    return (x + y + z);
}

// next 无参数
let it = f(5);

console.log(it.next());
console.log(it.next());
console.log(it.next());

// // next 有参数
// it = f(5);
// console.log(it.next());
// console.log(it.next(12));
// console.log(it.next(13));
//
// // 第一次调用 next 不能包含参数，若有，系统将忽略
// // next 有参数
// it = f(5);
// console.log(it.next(11));
// console.log(it.next(12));
// console.log(it.next(13));