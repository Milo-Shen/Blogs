function* gen() {
    try {
        yield console.log('hello');
        yield console.log('world');
    } catch (e) {
        console.log(`内部抛出：${e}`);
    }
}

let it = gen();
it.next();

try {
    it.throw('A');
} catch (e) {
    console.log(`外部抛出：${e}`);
}

console.log(it.next());