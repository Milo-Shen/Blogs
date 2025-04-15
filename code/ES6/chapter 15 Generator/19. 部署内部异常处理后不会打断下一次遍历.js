let generator = function* () {
    yield console.log('hello');
    yield console.log('world');
};

let g = generator();
g.next();

try {
    g.throw('A');
} catch (e) {
    // 此时遍历器已经结束
    g.next();
}