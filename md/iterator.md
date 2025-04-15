---
title: ES6 之 Iterator 和 for of 循环
date: 2018-1-2 22:00:00
tags: ES6
categories: ES6
comments: true

---

ES6 新增了两种集合类型 map 和 set，面对这愈来愈多的数据类型，Iterator 应运而生，它可以结合新的for of 循环，对于任何部署了 Iterator 接口的数据类型，都可以完成统一的遍历操作。
<!--more-->

## Iterator 作用
1. 为各种数据类型创造一个统一的访问接口
2. 使得数据类型的数据成员可以按照一个规定的顺序排列
3. 新增 for of 循环，用于循环任何部署了 Iterator 接口的数据结构

## Iterator 的执行过程
1. 创建一个指针对象，指向当前数据结构的起始位置（头位置，并非第一个数据成员）
2. 调用 next 方法，将指针位置指向数据结构的第一个成员(此时可以通过 value 读取该数据成员对应的值)
3. 不断调用 next方法，知道指针指向该数据结构的末尾处

## 关于 Iterator 的使用例子与分类
首先感谢阮一峰的 ES6 入门指南，下面的例子，大部分源于对于此书的学习记录和学习过程中遇到的困惑和个人探讨

### 模拟 Iterator 的 next 方法

```
// 累加器（ 无对应数据结构的遍历器对象 ）
let accumulator = array => {
    let index = 0;
    return {
        next: function () {
            return {value: index++, done: false}
        }
    }
};

// 获取遍历器指针
let it = accumulator();

console.log(it.next());  // {value: "a", done: false}
console.log(it.next());  // {value: "b", done: false}
console.log(it.next());  // {value: undefined, done: true}
```

上面的函数 accumulator 是一个遍历器生成函数，目的用于返回一个遍历器对象（也可称为指针），对其上的数据结构进行迭代。next 函数返回一个对象，里面有两个固定的 key 值，一个是 value（用于获取当前位置下成员的值），另一个是 done（boolean 值，用于表示遍历是否结束）

### Iterator 与数据结构的分离
Iterator 只是单纯得把遍历方式加到了数据结构上，遍历器代表了访问某一数据结构一种方式，故而遍历器和数据结构是分开的，甚至可以出现没有数据结构的单纯遍历器。

```
let idMaker = () => {
    let index = 0;
    return {
        next() {
            return {value: index++, done: false}
        }
    }
};

let it = idMaker();

console.log(it.next().value);
console.log(it.next().value);
console.log(it.next().value);
```

上面的例子中，遍历器生成函数 idMaker 并没有对应的数据结构，或者说，遍历器本身描述了一种数据结构

PS: 上面的例子，我们只是对遍历器生成函数进行了模拟，并没有实现，ES6语言自带的 Symbol.iterator 接口，故而上文中的例子无法供 for of 循环来消费，下面我们会介绍，ES6 语言自带的 iterator 接口，和如何自己去实现 ES6 官方定义的 iterator 接口

### 数据结构默认 Iterator 接口
ES6 中，默认的 Iterator 需要部署在 Symbol.iterator 属性，一个数据结构具有 Symbol.iterator 属性，证明其是可遍历的。调用 Symbol.iterator 就可得到当前数据结构默认的遍历器生成函数。在 ES6 中，数组 ，set ，map ，结构默认都是具有 默认实现的 Iterator 接口。

```
let arr = ['hello', 'world'];
let iterator = arr[Symbol.iterator]();

console.log(iterator.next());  // {value: "hello", done: false}
console.log(iterator.next());  // {value: "world", done: false}
console.log(iterator.next());  // {value: undefined, done: true}
```

上面例子中，变量 arr 是一个数组，我们可以通过 Symbol.iterator 属性来得到，数组默认的遍历器对象。

### 为类部署 Iterator 方法
ES6 并没有为对象或类原生实现 Iterator 接口，我们想让对象可以被 for of 遍历，则必须手动实现 Iterator 方法（若是该对象继承而来，那么该对象原型链上具有该方法也可以）

```
// 在 [Symbol.iterator] 上部署遍历器生成方法
class RangeIterator {
    constructor(start, end) {
        this.value = start;
        this.stop = end;
    }

    [Symbol.iterator]() {
        return this
    };

    next() {
        if (this.value < this.stop) {
            this.value++;
            return {done: false, value: this.value}
        } else return {done: true, value: undefined}
    }
}

// 在对象上使用 for of
function range(start, end) {
    return new RangeIterator(start, end);
}

for (let value of range(0, 3)) {
    // 输出 1, 2, 3
    console.log(value)
}
```

以上代码实现了一个类部署遍历器 Iterator 接口的写法

### 为对象部署 Iterator 方法

```
let Obj = {
    data: ['hello', 'world'],
    [Symbol.iterator]() {
        const self = this;
        let index = 0;
        return {
            next() {
                if (index < self.data.length) {
                    return {
                        value: self.data[index++],
                        done: false
                    }
                } else return {
                    value: undefined,
                    done: true
                }
            }
        }
    }
};

for (let i of Obj) {
    // 输出 hello , world
    console.log(i)
}
```

上面部署的 Iterator 方法可以遍历对象 obj 下 data 属性中的数组内容

### 通过遍历器实现指针结构

```
function Obj(value) {
    this.value = value;
    this.next = null;
}

Obj.prototype[Symbol.iterator] = function () {
    let current = this;

    let iterator = {
        next: next
    };

    function next() {
        if (current) {
            let value = current.value;
            let done = current == null;
            current = current.next;
            return {
                done: done,
                value: value
            }
        } else return {done: true};
    }

    return iterator;
};

let one = new Obj(1);
let two = new Obj(2);
let three = new Obj(3);

one.next = two;
two.next = three;

for (let i of one) {
    // 输出 1，2，3
    console.log(i)
}
```

特别注意的是：上面的例子中，遍历器接口采用，Obj.prototype[Symbol.iterator] = function(){ } 的形式而不是 Obj.prototype[Symbol.iterator] = ()=>{ } 的形式是因为后一种形式中，let current = this 中的 this 我们希望获取的是对象 Obj 本身，而不是一个空对象

### NodeList 类数组部署 Iterator 方法

```
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// 或者
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

// 即可使用 ... 扩展运算符访问 dom 类数组对象
[...document.getElementById('id')];

// 等于 ES5 中如下操作
Array.prototype.slice.call(document.getElementById('id'))
```

### 类数组对象部署数组的 Iterator 方法

```
// 类数组对象，非类数组对象部署 Array 的 iterator 无效
let iterator = {
    0: 'hello',
    1: 'world',
    length: 2,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
};

for (let item of iterator) {
    // 输出 hello, world
    console.log(item)
}
```

### Symbol.iterator 必须部署的是遍历器生成函数

```
let iterator = {
    0: 'hello',
    1: 'world',
    length: 2,
    [Symbol.iterator]:()=>{}
};

for (let item of iterator) {
    // 不是遍历器生成函数 —— 解释器会报错
    console.log(item)
}
```

### 也可以使用 while 循环遍历迭代器对象

```
let iterator = {
    0: 'hello',
    1: 'world',
    length: 2,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
};

// 使用 while 循环遍历，打印 hello , world
let $iterator = iterator[Symbol.iterator]();
let $result = $iterator.next();
while (!$result.done){
    console.log($result.value);
    $result = $iterator.next();
}
```

### 使用迭代器迭代 Generator 函数

```
let generate = function* () {
    yield 1;
    yield *[2,3];
    yield 4;
};

let iterator = generate();

console.log(iterator.next());  // {value: 1, done: false}
console.log(iterator.next());  // {value: 2, done: false}
console.log(iterator.next());  // {value: 3, done: false}
console.log(iterator.next());  // {value: 4, done: false}
console.log(iterator.next());  // {value: undefined, done: true}
```

上面的例子中 yield* 后面跟着的也是一个可遍历的数据结构，所以使用迭代器遍历时，也会自动迭代 yield* 后面的内容

### 字符串的 Iterator 接口

```
let str = '123';

// 检查是否存在 Symbol.iterator 方法
console.log(typeof str[Symbol.iterator]);  // function 存在

let iterator = str[Symbol.iterator]();
console.log(iterator.next());  // {value: 1, done: false}
console.log(iterator.next());  // {value: 2, done: false}
console.log(iterator.next());  // {value: 3, done: false}
console.log(iterator.next());  // {value: undefined, done: true}
```

字符串作为一个类数组对象，ES6 也为其实现了原生的 Symbol.iterator 接口

## Iterator 迭代器的使用场合

1. 解构赋值
2. ... 扩展运算符
3. for ... of 循环
4. Array.from() 操作
5. 实例化或调用 Map, Set, WeakMap, WeakMap 时
6. Promise.all()
7. Promise.race()

## 迭代器 Iterator 的 return 和 throw 方法
除了 next 方法以外，迭代器还支持 return 和 throw 方法，自己实现迭代器之时，next方法是必须的。而 return 和 throw 方法可选择部署与否，下面介绍 return 方法， throw 方法放在下一章介绍（主要配合 Generator 函数使用）

### return 方法
当for ... of 循环提前退出(出错，或是 for of 循环体中执行了 break 或是 continue 方法)，此时就会自动调用迭代器的 return 方法

```
let arr = [1, 2, 3];

// 自己实现数组的迭代器接口
arr[Symbol.iterator] = function () {
    let position = 0,
        _this = this,
        length = this.length;

    return {
        // 定义 next 方法
        next() {
            if (position < length) return {value: _this[position++], done: false};
            else return {value: undefined, done: true}
        },
        // 定义 return 方法，此方法会自动在 for ... of 循环 break 或是 continue 时候执行
        return() {
            console.log('break the loop!');
            return {value: undefined, done: true}
        }
    }
};

for (let i of arr) {
    console.log(i);
    // 迭代一次，即 break ，此时控制台会打印 break the loop! 代表结束了循环
    break;
}
```

以上需要注意的是：return 语句必须返回一个对象，这是 Generator 所定义的。在上面的例子中，循环一次即 break 掉了，所以程序一共打印了第一次循环的 1 ，和 break 时执行迭代器内部 return 操作时打印的 break the loop!

## for ... of 循环
任何一个部署了 Symbol.iterator 接口的数据结构，都可以使用 for ... of 进行遍历。for ... of 执行时其内部调用的是被遍历对象本身部署的 Iterator 接口

### 对数组使用 for ... of 循环

```
let arr = ['hello', 'world'];
let iterator = arr[Symbol.iterator]();

// 以下两种写法等价
for (let i of arr) {
    console.log(i)
}

for (let j of iterator) {
    console.log(j)
}
```

以上两种写法，一种是用 for ... of 直接访问数组，一种是访问数组的迭代器指针，两种操作是等价的

### 对 map 使用 for ... of 循环

```
let setObj = new Set([1, 2, 3]);

for (let i of setObj) {
    // 输出 1, 2, 3
    console.log(i)
}
```

### 对 set 使用  for ... of 循环

```
let mapObj = new Map();
mapObj.set('a', 1);
mapObj.set('b', 2);

for (let [value, key] of mapObj) {
    // 输出 a 1, b 2
    console.log(value, key)
}
```

其他的字符串，NodeList 等实现了 iterator 接口的数据类型都可以使用 for ... of 遍历。

### 类数组快速实现 Iterator 接口

```
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
```

可以使用 ES6 中的 Array.from 方法 或是 ES5 中的 Array.prototype.slice.call 方法将类数组转变成真正的数组以后再用 for ... of 循环进行迭代

## 总结
1. 遍历器（迭代器）Iterator 可以和 continue, break, return 搭配使用
2. 只要部署了 Symbol.iterator 属性，可以使得所有数据结构拥有一致的访问接口