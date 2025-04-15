// 数组的 yield* 遍历
function* f() {
    yield 'start';
    yield* ['a', 'b', 'c']
}

for (let v of f()) {
    console.log(v);
}

// 字符串的 yield* 遍历
function* y() {
    yield 'hello';
    yield* 'world';
}

for (let v of y()) {
    console.log(v);
}