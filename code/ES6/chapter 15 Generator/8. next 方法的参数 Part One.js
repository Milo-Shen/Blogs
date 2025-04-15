// next 方法的参数会作为上一条 yield 语句的值

function* f() {
    for (let i = 0; true; i++) {
        let reset = yield i;
        if (reset) i = -1;
    }
}

let g = f();

console.log(g.next());
console.log(g.next());

// 此处输出 0 是 next 参数和 i++ 共同的效果
console.log(g.next(true));