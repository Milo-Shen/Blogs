let delegated = (function* () {
    yield 'a';
    yield 'b';
}());

let delegating = (function* () {
    yield 'c';
    yield* delegated;
    yield 'd';
}());

for (let v of delegating) {
    console.log(v);
}