let f = function* () {
    // 每一次 throw error 都会打断遍历器
    try {
        while (true) {
            yield
        }
    } catch (e) {
        console.log(`内部捕获: ${e}`);
    }
};

let it = f();
it.next();

try {
    it.throw('a');
    it.throw('b');
} catch (e) {
    console.log(`外部捕获：${e}`)
}