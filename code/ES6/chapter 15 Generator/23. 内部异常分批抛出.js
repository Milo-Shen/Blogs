function* gen() {
    try {
        yield console.log('hello');
    } catch (e) {
        console.log(`内部抛出：${e}`);
    }
    yield console.log('world');
    yield console.log('end');

}

let it = gen();
it.next();

try {
    // throw 方法被捕获后，会附带执行下一条 next (为何)
    it.throw('A');
} catch (e) {
    console.log(`外部抛出：${e}`);
}
