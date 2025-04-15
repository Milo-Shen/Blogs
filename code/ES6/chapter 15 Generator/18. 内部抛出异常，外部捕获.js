let f = function* () {
    while (true) {
        yield 'Hello';
    }
};

let it = f();
console.log(it.next());

try {
    it.throw('a');
    it.throw('b');
} catch (e) {
    // 外部捕获时，会打断循环的执行
    console.log(`外部捕获：${e}`);
}