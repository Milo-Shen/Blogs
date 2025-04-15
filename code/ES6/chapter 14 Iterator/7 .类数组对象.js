// 类数组对象
let iterator_v1 = {
    0: 'hello',
    1: 'world',
    length: 2,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
};

for (let item of iterator_v1) {
    console.log(item)
}

// 普通对象 —— 无效果
let iterator_v2 = {
    a: 'hello',
    b: 'world',
    length: 2,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
};

for (let item of iterator_v2) {
    console.log(item)
}

// 使用 while 循环遍历
let $iterator = iterator_v1[Symbol.iterator]();
let $result = $iterator.next();
while (!$result.done){
    console.log($result.value);
    $result = $iterator.next();
}

// 不是遍历器生成函数 —— 解释器会报错
let iterator_v3 = {
    0: 'hello',
    1: 'world',
    length: 2,
    [Symbol.iterator]:()=>{}
};

for (let item of iterator_v3) {
    console.log(item)
}