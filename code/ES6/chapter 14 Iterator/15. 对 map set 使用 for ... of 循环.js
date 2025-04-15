let setObj = new Set([1, 2, 3]);

for (let i of setObj) {
    // 输出 1, 2, 3
    console.log(i)
}

let mapObj = new Map();
mapObj.set('a', 1);
mapObj.set('b', 2);

for (let [value, key] of mapObj) {
    // 输出 a 1, b 2
    console.log(value, key)
}