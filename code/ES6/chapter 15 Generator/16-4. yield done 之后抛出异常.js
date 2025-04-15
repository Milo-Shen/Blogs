let f = function* () {
    try {
        yield 'hello';
        yield 'world';
    }
    catch (e) {
        console.log(`内部捕获: ${e}`);
    }
};

let it = f();
// 此时 throw ，generator 函数尚未开始，是外部捕获
console.log(it.next());
// 此时 throw (第一次) ，generator 函数尚未结束，是内部捕获
console.log(it.next());
// 此时 throw (第一次)，generator 函数尚未结束，是内部捕获
console.log(it.next());
// 此时 throw ，generator 函数已经结束，是外部捕获

try {
    it.throw('a');
    it.throw('b');
} catch (e) {
    console.log(`外部捕获：${e}`)
}