function* add() {
    yield 1 + 2;
}

let it = add();

console.log(it.next());
console.log(it.next());