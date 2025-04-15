// 法一：直接使用 yield
function* objectEntries(obj) {
    let propKeys = Reflect.ownKeys(obj);
    for (let propKey of propKeys) {
        yield [propKey, obj[propKey]];
    }
}

let jane = {first: 'jane', last: 'Doe'};

for (let [key, value] of objectEntries(jane)) {
    console.log(key, value)
}

// 法二：将 Generator 函数添加到对象的 Symbol.iterator 属性上
function* objectIterator() {
    let propKeys = Reflect.ownKeys(this);
    for (let propKey of propKeys) {
        yield [propKey, this[propKey]];
    }
}

let joke = {first: 'joke', last: 'Merry'};

joke[Symbol.iterator] = objectIterator;

for (let [key, value] of joke) {
    // 此处会把 Symbol.iterator 也遍历出来
    // todo 分析如何避免打印额外元素
    console.log(key, value);
}