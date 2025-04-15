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
    g.throw('A');
} catch (e) {
    // 此时遍历器已经结束
    g.next();
}
