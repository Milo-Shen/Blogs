let f = function* () {
    try {
        yield 'hello';
        yield 'world';
        yield 'end';
    }
    catch (e) {
        console.log(`内部捕获: ${e}`);
    }
};

let it = f();
it.next();

try {
    console.log(it.throw('a'));
    console.log(it.throw('b'));
} catch (e) {
    console.log(`外部捕获：${e}`)
}