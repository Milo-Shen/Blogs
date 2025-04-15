function* helloWorld() {
    yield 'hello';
    yield 'world';
    return 'ending';
}

let it = helloWorld();

console.log(it.next());
console.log(it.next());
console.log(it.next());