function* f() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    return 5;
}

// for ... of 循环遇到 done:true 时，循环终止，并且遍历结果不包含该值
for (let i of f()) {
    console.log(i)
}
