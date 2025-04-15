let f = function* () {
    while (true) {
        try {
            yield
        }
        catch (e) {
            // throw 语句抛出的异常只能交由系统的 catch 捕获
            if (e !== 'a') throw e;
            console.log(`内部捕获: ${e}`);
        }
    }
};

let it = f();
// todo 此处为何要先执行 next
it.next();

try {
    it.throw('a');
    it.throw('b');
} catch (e) {
    console.log(`外部捕获：${e}`)
}