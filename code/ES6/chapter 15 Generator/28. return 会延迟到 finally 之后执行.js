function* f() {
    yield 1;
    try {
        yield 2;
        yield 3;
    } finally {
        yield 4;
        yield 5;
    }
    yield 6;
}

let it = f();


console.log(it.next());

// 此时尚未进入 try 块
console.log(it.next());

// 此时进入 try 块，直接进入 finally 块
console.log(it.return(7));

console.log(it.next());

// 此时还未退出 try 块

console.log(it.next());
// 此时处于 finally 中，但由于不是由于 return 进入的故而和普通执行 return 效果一致

// 出了 finally 块后，此时执行 return ，结束了迭代，所以后一条 next 无法输出 6
console.log(it.next());