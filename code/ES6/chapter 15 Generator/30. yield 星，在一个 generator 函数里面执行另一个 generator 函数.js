function* f() {
    yield 'a';
    yield 'b';
}

function* y() {
    yield 'c';
    yield* f();
    yield 'd';
}

function* x() {
    yield 'c';
    // 没有 * 仅仅返回一个遍历器
    yield f();
    yield 'd';
}

function* z() {
    yield 'c';
    for (let v of f()) {
        yield v
    }
    yield 'd';
}

for (let v of y()) {
    console.log(v);
}

for (let v of x()) {
    console.log(v);
}


for (let v of z()) {
    console.log(v);
}
