function* f() {
    yield 1;
    yield 2;
    return 3;
    yield 4;
}

// 扩展运算符
console.log([...f()]);

// Array.from
console.log(Array.from(f()));

// for ... of 循环
for (let i of f()) {
    console.log(i)
}