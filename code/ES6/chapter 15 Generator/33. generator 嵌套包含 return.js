function* f() {
    yield 'a';
    yield 'b';
    return 'return value';
}

function* y() {
    yield 1;
    yield 2;
    let value = yield* f();
    console.log(value);
}

let it = y();

console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());