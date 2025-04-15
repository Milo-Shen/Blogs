let arr = ['hello', 'world'];
let iterator = arr[Symbol.iterator]();

// 以下两种写法等价
for (let i of arr) {
    console.log(i)
}

for (let j of iterator) {
    console.log(j)
}