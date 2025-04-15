function* getFuncWithReturn() {
    yield 'a';
    yield 'b';
    return 'the result';
}

function* logReturn(gen) {
    let result = yield* gen;
    // 此句先执行
    console.log(result);
}

console.log([...logReturn(getFuncWithReturn())]);