// return 可以返回指定的值，并终结 Generator 函数的遍历
function* f() {
    yield 1;
    yield 2;
    yield 3;
}

let it = f();
console.log(it.next());
console.log(it.return('end'));
console.log(it.next());