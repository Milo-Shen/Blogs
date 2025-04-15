let f = function* () {
    while (true) {
        yield;
    }
};

let it = f();

try {
    // 猜测还未进入到 try 块便抛出了异常，导致无法被内部 catch
    it.throw('a');
    it.throw('b');
} catch (e) {
    console.log(`外部捕获：${e}`)
}