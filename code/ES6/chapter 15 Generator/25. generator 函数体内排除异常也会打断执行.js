function* g() {
    yield 1;
    console.log('throw an exception');
    throw new Error('generator broke !');
    yield 2;
    yield 3;
}

let it = g();

// 第一次执行 next 方法
console.log(it.next());

// 第二次执行 next 方法
try {
    console.log(it.next());
} catch (err) {
    console.log(err);
}

// 第三次执行 next 方法
// 由于上一次抛出的 error 迭代器此时已被打断，done: true
try {
    console.log(it.next());
} catch (err) {
    console.log(err);
}
