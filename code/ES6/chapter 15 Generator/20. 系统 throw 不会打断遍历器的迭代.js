let generator = function* () {
    try {
        yield console.log('hello');
        yield console.log('world');
        yield console.log('end');
    } catch (e) {
        console.log(`内部捕获：${e}`);
    }

};

let g = generator();
g.next();

try {
    throw new Error('B');
} catch (e) {
    // 外部抛出异常
    console.log(`外部抛出异常: ${e}`);
    // 此时遍历器已经结束
    g.next();
}
