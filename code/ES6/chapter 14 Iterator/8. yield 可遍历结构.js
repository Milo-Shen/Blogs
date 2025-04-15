let generate = function* () {
    yield 1;
    yield *[2,3];
    yield 4;
};

let iterator = generate();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());