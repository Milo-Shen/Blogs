let arraylike = {
    0: 1,
    1: 2,
    length: 2
};

// 用 array.from 快速部署，实际上是把类数组转换成了真实数组
for (let i of Array.from(arraylike)) {
    console.log(i)
}

// 或是使用 ES5 的方法，将类数组转换成数组
for (let i of Array.prototype.slice.call(arraylike)) {
    console.log(i)
}