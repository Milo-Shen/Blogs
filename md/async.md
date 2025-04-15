---
title: ES6 之 Async 函数
date: 2018-02-24 14:03:00
tags: ES6
categories: ES6
comments: true

---

async 函数本质上近似于 Generator 函数 + 自动执行器的语法糖，由 ES2017 标准引入，并且在 nodejs v8.0 及其以上版本中提供了原生支持，下面我们介绍一下 async 函数的用法和特点
<!--more-->

## async 的特点
首先我们举一个 async 的例子方便下面的说明

```
// 引入 fs 模块
const fs = require('fs');

// 将 readFile 包装成 Promise 对象
let readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
};

// async 读取文件
let asyncReadFile = async function () {
    let f1 = await readFile('./txt/A.txt');
    let f2 = await readFile('./txt/B.txt');
    let f3 = await readFile('./txt/C.txt');
    console.log(`${f1} ${f2} ${f3}`);
};

// 输出： A, B, C
asyncReadFile();
```

上面的例子中，我们使用 async 函数依次读取了文件 A,B,C 并输出了最终结果

### Async 与 Generator 之间的异同

1. async 函数内置执行器，不需要像 Generator 函数那般使用类似 co 这样的外部执行器
2. 更好的语义
3. 更广的适用性，co 模块后面只能跟 Promise 对象，await 后面除了可以跟 Promise 对象，也可以跟原始类型值(number、String、Boolean)此时等同于同步操作
4. async 函数的返回值是一个 Promise 对象

### Async 函数的另一个例子

```
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function Print(value, ms) {
    await timeout(ms);
    console.log(value)
}

// 500ms 后将输出字符串 'Hello'
Print('Hello', 500);

// 因为 async 反回 Promise，故而也可以写成
async function timeout(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function Print(value, ms) {
    await timeout(ms);
    console.log(value)
}

// 500ms 后将输出字符串 'Hello'
Print('Hello', 500);
```

上面的代码将会在 500ms 后输出 'Hello'

### async 内部 return 的值会成为 then 方法回调函数的参数

```
async function fn() {
    return 'Hello World';
}

// 输出：'Hello World'
fn().then(v => console.log(v));
```

上面的例子中，async 函数内部 return 语句返回的值，会成为 then 回调函数的参数。


### async 函数内部抛出的错误会导致返回的 Promise 对象变成 Rejected 状态

```
async function fn() {
    return x / 2;
}

fn().then(
    v => console.log(v),
    e => console.log(e)
);

// 也可以使用 catch 语句来捕捉异常
fn().then(
    v => console.log(v)
).catch(e => console.log(e));
```

上面定义的函数 fn 中，x 未定义，故而会抛出异常，导致返回的 Promise 对象被 rejected 掉。该异常可以在 reject 回调中处理，也可以在 Promise 对象的 catch 语句中处理

### async 函数返回的 Promise 对象只有在所有 await 函数都执行完毕后，再执行 then 方法

```
async function fn() {
    let f1 = await new Promise(resolve => setTimeout(resolve, 100, 'Hello'));
    let f2 = await new Promise(resolve => setTimeout(resolve, 200, 'World'));
    let f3 = await new Promise(resolve => setTimeout(resolve, 300, '!'));
    return `${f1} ${f2} ${f3}`
}

fn().then(
    // 输出：Hello World !
    v => console.log(v),
    e => console.log(e)
);
```

上面的例子中，有三个 await 命令，后面跟着分别执行时长为 100ms 200ms 300ms 的三个 Promise 对象，async 函数会等这三个 await 命令后面跟着的操作都执行完成后，在执行 then 方法，故而我们可以发现，最后 then 方法输出的是所有操作的返回值的总和

### await 命令后面跟的若不是一个 Promise 对象，则会自动将之转换成 Promise 对象

```
async function fn() {
    return await 123;
}

// 自动将原始类型 123 转换成 Promise 对象
fn().then(v => console.log(v));
```

### 只要有一个 await 命令后面的 Promise 被 reject 掉，则整个 async 函数将终止

```
async function fn() {
    await Promise.reject('出错了');
    await Promise.resolve('Hello World !');
}

// 输出：出错了
// await Promise.resolve('Hello World !') 此语句不执行
fn().then(
    v => console.log(v),
    e => console.log(e)
);
```

上面的例子中，由于第一句 await 语句即被 reject 掉了，故而后续的 await 语句不再执行，该 async 函数终止

### await reject 后不终止 async 函数
若是我们希望即使 async 函数中即使有一个异步被 reject 掉也不影响其他异步的执行，则可以使用以下两种方式去处理

```
// try catch 包裹的方式
async function fn() {
    try {
        await new Promise((resolve, reject) => setTimeout(reject, 50, 'error 1'))
    } catch (e) {
        console.log(e);
    }
    return await new Promise(resolve => setTimeout(resolve, 50, 'Hello !'))
}

fn().then(
    v => console.log(v),
);


// Promise 后跟 catch 的方式
async function fn() {
    await new Promise((resolve, reject) => setTimeout(reject, 50, 'error 1')).catch(e => console.log(e));
    return await new Promise(resolve => setTimeout(resolve, 50, 'Hello !'))
}

fn().then(
    v => console.log(v),
);
```

### async 和普通函数的一个异同

```
function fn() {
    try {
        new Promise((resolve, reject) => setTimeout(reject, 50, 'error 1'))
    } catch (e) {
        // 此处无法捕获错误，reject 将会被抛出至全局
        console.log(e);
    }
}

fn();
```

<font color="red">和普通函数相比，普通函数的 try catch 无法捕获异步操作抛出的错误，但是 async 中的可以</font>

### 若是 await 后跟的异步操作报错，则返回的 Promise 也会被 reject 掉

```
async function fn() {
    await new Promise((resolve, reject) => {
        throw new Error('error !');
    })
}

// reject 回调捕获异常
fn().then(
    v => console.log(v),
    e => console.log(e)
);

// catch 捕捉异常
fn().then(
    v => console.log(v)
).catch(e => console.log(e));
```

上面的代码中，async 函数执行后，await 后面的异步操作产生异常，同样会导致该返回的 Promise 对象的状态变为 reject。可以被 catch 或是 reject 回调捕捉到  

当然同样的，也可以在 try catch 中捕获该处理该种异常

```
async function fn() {
    try {
        await new Promise(() => {
            throw new Error('error')
        })
    }
    catch (e) {
        console.log(e)
    }

    return await 'Hello'
}

// 输出：Hello
fn().then(v => console.log(v));
```

### 使用 try catch 进行多次异步请求

```
const fetch = require('node-fetch');
const max_repeat = 3;

async function test() {
    let i = 0;
    for (i = 0; i < max_repeat; i++) {
        try {
            await fetch('http://www.baidu.com');
            break;
        } catch (e) {
            console.log(e)
        }
    }
    console.log(i);
}

test();
```

上面的例子中，如果 await 操作成功，则会使用 break 终止循环；如果失败，则会被 catch 语句捕捉，然后进入下一轮循环

### async 使用注意点

1. 建议把 async 函数的 await 命令用 try catch 扩起来，捕获异常
2. 若是异步操作之间没有先后顺序，建议同时触发

### async 顺序 & 并发执行异步操作

```
function f1() {
    return new Promise(resolve => setTimeout(resolve, 100, 'Hello'));
}

function f2() {
    return new Promise(resolve => setTimeout(resolve, 200, 'World'));
}

function f3() {
    return new Promise(resolve => setTimeout(resolve, 300, '!'));
}

// 串行写法
async function fn1() {
    let start = new Date();
    let v1 = await f1();
    let v2 = await f2();
    let v3 = await f3();
    let end = new Date();
    console.log(`fn1 输出：${v1} ${v2} ${v3}, 耗时：${end - start}`);
}

// 并行写法
async function fn2() {
    let start = new Date();
    let [v1, v2, v3] = await Promise.all([f1(), f2(), f3()]);
    let end = new Date();
    console.log(`fn2 输出：${v1} ${v2} ${v3}, 耗时：${end - start}`);
}

// fn1 输出：Hello World !, 耗时：607
fn1();

// fn2 输出：Hello World !, 耗时：300
fn2();
```

从上面的例子中可以看出，顺序写法中，程序会等待上一个异步完成后再去执行下一个异步，所以总耗时为 607ms，正好是上面 f1, f2, f3 三个异步任务的耗时总和 (100ms + 200ms + 300ms = 700ms)。其中多出来的 7ms 是函数调用的时间开销。

### 使用 async 顺序 & 并发调用 (结合 Promise.all)

```
// 获取 fetch
const fetch = require('node-fetch');

// api 地址
let books = [
    'https://api.douban.com/v2/book/1220560',
    'https://api.douban.com/v2/book/1220561',
    'https://api.douban.com/v2/book/1220562'
];

// 继发执行异步
async function sequence() {
    for (let book of books) {
        let response = await fetch(book).then(v => v.json());
        console.log(response)
    }
}

 sequence();

// 并发执行异步
async function asyncFn() {
    let [v1, v2, v3] = await Promise.all(books.map(url => fetch(url).then(v => v.json())));
    console.log(v1, v2, v3);
}

asyncFn();
```

可以使用上述两种方式，进行继发（按顺序）的异步调用，或是并行的异步调用。  
<font color="red">需要注意的是 Promise 对象具有定义立即执行的特点，所以使用 Promise.all 方法的时候，需要注意使用的时机，最好在使用时才定义！</font>

### 使用 async 顺序 & 并发调用
上面的 Promise.all 虽然可以做到并发执行，但是 Promise.all 有一个特性，当其中某一个 promise 函数被 reject 掉后，整个 Promise.all 会被 reject 掉，且以第一个被 Rejected 的实例的返回值作为整个 Promise.all 的返回值。  
<font color="red">从上面 Promise.all 的特性可以看出，只有当所有的 fetch 操作成功才能保证 Promise.all 的返回值是我们真正想要的。要是有一个 fetch 操作失败，则所有的 fetch 操作变得没有意义，这显然是无法接受的，下面介绍另一种方法</font>

```
// 获取 fetch
const fetch = require('node-fetch');

// api 地址
let books = [
    'https://api.douban.com/v2/book/1220560',
    'https://api.douban.com/v2/book/1220561',
    'https://api.douban.com/v2/book/1220562'
];

// 并发执行异步
async function asyncFn() {
    let results = books.map(async url => {
        try {
            let response = await fetch(url);
            return response.json();
        }
        catch (e) {
            return 'NONE';
        }
    });
    for (let item of results) {
        let data = await item;
        console.log(data);
    }
}

// 输出三个接口的返回值
asyncFn();
```

上面的例子中，我们使用 map 函数来对所有的 api 进行并发 fetch 操作。再用 for of 操作，进行读出 fetch 结果，for of 中使用 await 是因为在 map 函数中使用了 async 函数，async 函数返回的是一个 promise 对象，故而在 for of 循环读出数据的时候使用 await 使其变成正常 json 数据
