let f = function* () {
    while (true) {
        try {
            yield
        }
        catch (e) {
            console.log(`内部捕获: ${e}`);
        }
    }
};

let it = f();

try {
    it.throw('a');
    it.throw('b');
} catch (e) {
    console.log(`外部捕获：${e}`)
}