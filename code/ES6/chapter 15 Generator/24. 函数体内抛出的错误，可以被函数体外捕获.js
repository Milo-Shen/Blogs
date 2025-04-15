function* f() {
    let x = yield 3;
    let y = x.toUpperCase();
    yield y;
}

let it = f();
it.next();

try {
    it.next(42);
} catch (err) {
    console.log(err);
}