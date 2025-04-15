---
title: ES6 之 Generator 函数的应用
date: 2018-02-20 15:24:00
tags: ES6
categories: ES6
comments: true

---

前言：本章主要介绍一下 Generator 函数的应用。在 Generator 函数诞生以前，我们主要是用诸如，回调函数，事件监听，发布订阅，Promise 对象等方式进行异步操作。Generator 函数的诞生，将为异步调用带来一个全新的体验
<!--more-->

## 异步任务使用 Generator 封装的例子

```
let fetch = require('node-fetch');

function* gen() {
    let url = 'https://api.gethub.com/users/github';
    let result = yield fetch(url);
    console.log(result);
}

let g = gen();
let result = g.next();

// 进行异步 fetch 操作
result.value
    .then(data => data.json())
    .then(data => g.next(data));
```

上面的例子使用了 Generator 函数封装了一个异步应用，该操作使用第一个 next 方法，读取了一个远程接口的数据，再用第二个 next ，将获取的数据作为前一个 yield 的值传给 console.log 函数输出。  
<font color="brown">虽然 Generator 函数将异步操作表示地很简洁，但是流程管理却很不方便（需要手动控制并执行 Generator 函数的第一阶段、第二阶段等等），故而下面介绍 Thunk 函数和自动迭代器来简化 Generator 的流程管理</font>

## Javascript 函数的 Thunk 函数
Javascript 中的 Thunk 用于将多参数函数转化为单参数函数

```
let fs = require('fs');

fs.readFile(fileName, callback);

let Thunk = function (fileName) {
    return function (callback) {
        return fs.readFile(fileName, callback);
    }
};

let readFileThunk = Thunk(fileName);
readFileThunk(callback);  // 此刻才执行 fs.readFile 函数！
```

上面的代码中，Thunk 函数将 fs 模块的 readFile 这个多参数函数（接受 fileName, callback 两个参数）转化成了只接收 callback(fileName 在转换过程中已经植入) 的单参数函数。这个单参数版本就叫做 Thunk 函数。  
<font color="red">PS：需要注意的是，上面的例子中，只有在执行 `readFileThunk(callback)` 语句时，才是 `fs.readFile` 真正执行的时机！</font>  
<font color="green">这里 Thunk 单参数的一个作用就体现出来了，就是可以滞后被包裹的底层函数的真正执行时机。</font>

### Thunk 函数转换代码

```
// ES5版本
let Thunk = function(fn){
    return function (){
        let args = Array.prototype.slice.call(arguments);
        return function (callback){
            args.push(callback);
            return fn.apply(this, args);
        }
    };
};

// ES6版本
let Thunk = function(fn) {
    return function (...args) {
        return function (callback) {
            return fn.call(this, ...args, callback);
        }
    };
};

// 用法
var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```

上面的转换器可以将多参数函数转换成 Thunk 单参数函数形式。  
<font color="green">除此之外，也可以使用 npm 上的 Thunkify 模块进行转换</font>

## Thunk 与 Generator 函数的流程管理
之前介绍的 Thunk 函数就是为了和 Generator 函数配合去实现异步操作的自动流程管理。

### 同步 Generator 函数的自动执行

```
function* gen() {
    yield 1;
    yield 2;
    yield 3;
}

let g = gen();
let res = g.next();

while(!res.done){
    //输出 1, 2, 3
    console.log(res.value);
    res = g.next();
}
```

上面的代码中，Generator 函数会自动完成所有步骤。但是上述的操作只适合同步操作。必须保证前一步完成后再去执行后一步。所以不适合异步操作，这时候，Thunk 函数就有了用武之地

```
let fs = require('fs');
let thunkify = require('thunkify');
let readFileThunk = thunkify(fs.readFile);

let gen = function* (){
    let r1 = yield readFileThunk('/etc/a.txt');
    console.log(r1.toString());
    let r2 = yield readFileThunk('/etc/b.txt');
    console.log(r2.toString());
};
```

上面的代码中，yield 命令将程序的控制权移交给了函数 readFileThunk，Thunk 函数用于在异步操作完成后再将程序控制权移交回 readFileThunk 函数，下面手动执行上述的 Generator 函数来便于理解

```
let g = gen();

let r1 = g.next();
r1.value(function (err, data) {
    if (err) throw err;
    let r2 = g.next(data);
    r2.value(function (err, data) {
        if (err) throw err;
        g.next(data);
    });
});
```

上面的函数中执行到 `yield readFileThunk('/etc/a.txt')` 这句的时候，readFileThunk 函数返回的是另一个函数 `function(callback){fs.readFile(fileName, callBack)} 即为 r1.value`，此时异步操作 `fs.readFile` 尚未被执行。只有当 `r1.value` 执行的时候 `fs.readFile` 才真正被执行。由于 `r1.value` 的参数就是 `fs.readFile` 的回调函数，故而 `g.next(data)` 操作是在异步操作的回调中完成的。也就证明了 Thunk 函数可以用于异步 Generator 函数的自动执行。  
同时我们可以看到，上述函数的执行过程其实就是把同一个回调函数反复传入 next 方法的 value 属性中。所以这个过程我们可以使用递归来描述

### Thunk 函数异步自动管理流程
这里我们先创建3个文件(A.txt B.txt C.txt)里面的内容分别为 A B C。然后使用 Thunk 和 Generator 自动对这三个文件的异步读取进行自动化的流程管理

```
let fs = require('fs');

// 部署 Thunk 转换代码
let Thunk = function (fn) {
    return function (...args) {
        return function (callback) {
            return fn.call(this, ...args, callback);
        }
    };
};

// 部署 Thunk 版 readFile 函数
let readFile = Thunk(fs.readFile);

// Thunk 结合 Generator 进行异步处理
let g = function* () {
    let f1 = yield readFile('./txt/A.txt');
    let f2 = yield readFile('./txt/B.txt');
    let f3 = yield readFile('./txt/C.txt');
    console.log(`${f1}, ${f2}, ${f3}`);
};
```

上面的代码中，我们先做一些准备。首先是我们把异步多参数的 fs.readFile 函数通过 Thunk 转换成了异步单参数函数。其次我们申明了一个 Generator 函数用于异步读取三个 txt 文件中的内容，且 yield 命令后面跟着的是一个 Thunk 函数，下面我们写一个自动执行器 run 去帮我们自动执行（管理）该 Generator 函数

```
// 自动执行器 run
function run(fn) {
    let gen = fn();

    function next(err, data) {
        let result = gen.next(data);
        if (result.done) return;
        result.value(next);
    }

    next();
}

//输出：A, B, C
run(g);
```

上面构建的 run 函数通过不断地将 next 传入 Thunk 函数的形参（即为原生 readFile 函数的 callback）使得 Generator 函数 g 得以自动执行，并输出了最终结果 A, B, C  
<font color="red">使用 Thunk 自动管理 Generator 异步操作的前提是，每一个异步操作都要是 Thunk 类型的函数，也就是 yield 后面跟着的必须是一个 Thunk 函数</font>

## Co 模块与 Generator 自动异步流程管理
除了使用 Thunk 函数，我们也可以使用 co 模块来进行异步流程管理。它与 Thunk 的异同如下：

1. 都是通过将程序控制权交回 Generator 函数的方式进行异步流程管理
2. Thunk 是使用回调函数 callback 的方式去交还控制权，故而 yield 后面需要跟 Thunk 函数
3. co 模块则将异步操作包装成 Promise 对象，用 then 的方式交回控制权，故而 yield 后面需要跟 Promise 函数

### 使用 co 模块执行异步 Generator 的例子

```
let fs = require('fs');
let co = require('co');

// 将 readFile 包装成 Promise 对象
let readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
};

// Thunk 结合 Generator 进行异步处理
let g = function* () {
    let f1 = yield readFile('./txt/A.txt');
    let f2 = yield readFile('./txt/B.txt');
    let f3 = yield readFile('./txt/C.txt');
    console.log(`${f1}, ${f2}, ${f3}`);
};

// 输出 A, B, C
co(g);
```

上面的例子中，我们先把 readFile 包装成 Promise 对象，再将 Generator 函数 g 传入 co 模块便会自动执行，输出：A, B, C。下面介绍一下 co 模块的原理

### 基于 Promise 对象的自动执行（ co 原理 ）

```
// 此处的 readFile 是 Promise 函数
let gen = function* () {
    let f1 = yield readFile('./txt/A.txt');
    let f2 = yield readFile('./txt/B.txt');
    let f3 = yield readFile('./txt/C.txt');
    console.log(`${f1}, ${f2}, ${f3}`);
};

// 手动执行 Generator 函数
let g = gen();
g.next().value.then(function (data) {
    g.next(data).value.then(function (data) {
        g.next(data).value.then(function (data) {
            g.next(data);
        })
    })
});
```

上面的例子中，我们手动执行了 generator 函数 g，可以看到手动执行就是不断调用 then 方法层层添加回调函数，基于这一点我们依然可以用递归写出一个自动执行器

```
// 自动执行器
function run(gen) {
    let g = gen();

    function next(data) {
        let result = g.next(data);
        if (result.done) return result.value;
        result.value.then(function (data) {
            next(data);
        })
    }

    next();
}

// 输出：A, B, C
run(gen);
```

如上所示，只要 generator 还没执行到结尾，就递归调用 next 达到自动执行的目的。

### 使用 Co 处理并发的异步操作

```
// 数组的写法
co(function* () {
    let result = yield [
        readFile('./txt/A.txt'),
        readFile('./txt/B.txt'),
        readFile('./txt/C.txt')
    ];
    // 输出：A, B, C
    console.log(`${result[0]} ${result[1]} ${result[2]}`);
}).catch(e => console.log(e));

// 对象的写法
co(function* () {
    let result = yield {
        0: readFile('./txt/A.txt'),
        1: readFile('./txt/B.txt'),
        2: readFile('./txt/C.txt'),
    };
    // 输出：A, B, C
    console.log(`${result[0]} ${result[1]} ${result[2]}`);
}).catch(e => console.log(e));
```

上面的代码并发执行了 3 个异步操作。并且输出了结果 A, B, C  
<font color="red">PS：需要注意的是，此处默认拿到的数据时 Buffer，并非是 String，输出的结果在 `` 操作中进行了隐式转换</font>

### 使用自动化异步流程管理处理 Stream 数据流
Stream 流在处理大文件时，会把大文件分割成块，依次处理。下面我们使用 co 模块结合 Generator 尝试处理 Stream 数据流

```
const co = require('co');
const fs = require('fs');

// 创建只读数据流
const stream = fs.createReadStream('./txt/book.txt');

co(function* () {
    while (true) {
        let result = yield Promise.race([
            new Promise(resolve => stream.once('data', resolve)),
            new Promise(resolve => stream.once('end', resolve)),
            new Promise((resolve, reject) => stream.once('error', reject))
        ]);
        // 最后一次无数据时是 undefined，故而进行空值检查
        console.log((result || '').toString());
        if (!result) break;
        stream.removeAllListeners('data');
        stream.removeAllListeners('end');
        stream.removeAllListeners('error');
    }
});
```

上面的代码采用 Stream 的模式读取了文本 book.txt 中的内容，这种方式有益于提升处理大文件时候的可靠性和性能。