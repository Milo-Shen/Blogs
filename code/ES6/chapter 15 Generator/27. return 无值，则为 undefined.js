// return 没有返回值默认为 undefined
function* f() {
    yield 1;
    yield 2;
    yield 3;
}

let it = f();
console.log(it.next());
console.log(it.return());
console.log(it.next());