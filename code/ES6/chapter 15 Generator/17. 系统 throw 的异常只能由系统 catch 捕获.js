let f = function* () {
    while (true) {
        try {
            yield
        }
        catch (e) {
            // throw 语句抛出的异常只能交由系统的 catch 捕获
            if(e !== 'a') throw e;
            console.log(`内部捕获: ${e}`);
        }
    }
};

let it = f();
it.next();

try {
    throw new Error('a');
    throw new Error('b');
} catch (e) {
    console.log(`外部捕获：${e}`)
}