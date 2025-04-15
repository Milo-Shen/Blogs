---
title: ES6 之 Promise 用法解析
date: 2018-01-24 16:00:00
tags: ES6
categories: ES6
comments: true

---

Promise 在之前的版本中均有第三方库实现，但是 ES6 将其纳入了语言标准，统一了用法，并提供了原生的 Promise 实现，下面我们介绍一下 promise 的具体用法为何（参考学习，阮一峰 << ES6权威指南 第二版 >>，特此感谢）

<!--more-->

## Promise 的特点
1. 对象不受外界影响。Promise 对象代表一个异步操作，有 Pending (进行中) , Resolved (已完成，又称 Fulfilled) 和 Reject (已失败) 三种状态。只有异步操作的结果可以决定当前是哪一种状态，任何其他操作都无法改变这个状态
2. 一但 Promise 的状态改变就不会再变，并且在任何时候都可以得到最终的状态结果。Promise 对象的状态改变有 2 中情况，一种是从 Pending 变为 Resolved。另一种是从 Pending 变为 Rejected。
3. Promise 状态改变后，再对 Promise 对象添加回调函数也可以得到最终结果
4. 无法取消 Promise，一旦建立，它就会立即执行，无法中途取消。
5. 若是不设置回调函数，Promise 内部抛出的错误不会反应到外部
6. 当 Promise 处于 Pending 状态时，无法得知 Promise 是刚开始执行还是即将完成

## 下面列举 Promise 的用法
下面我们列举一下 Promise 的各种基本用法，和执行结果

### Promise 的语法

```
// promise 函数的定义
let promise = new Promise(function (resolve, reject) {
    if (/* 异步操作成功*/) resolve(value);
    else reject(error);
});

// promise 函数的使用
promise.then(function (value) {
    // success
}, function (value) {
    // failure
});
```

1. Promise 接受一个函数作为参数，该函数的参数为 resolve 和 reject，他们是由 ES6 引擎本身提供的两个函数，故而不需要手动部署
2. resolve 的作用是，将 Promise 对象的状态从 “未完成” 变为 “成功” （Penging => Resolved），并且将异步调用成功后的返回值作为参数传递出去
3. reject 的作用是，将 Promise 函数的状态从 “未完成” 变为 “失败” （Pending => Rejected），在异步操作失败时调用，将异步操作抛出的错误作为参数传递出去

### 第一个 Promise 例子

```
function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms, 'done');
    })
}

timeout(500).then((value) => {
    // 500 秒后会输出字符串 'done'
    console.log(value)
});
```

上面的例子中，500秒后会输出字符串 'done'

### Promise 异步加载图片

```
let loadImageAsync = url => {
    return new Promise(function (resolve, reject) {
        let image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('no image found !'));
        image.src = url;
    });
};

let imgSrc = '//img.shenyujie.cc/2018-8-8-kimi-24.PNG';
loadImageAsync(imgSrc).then(succ => {
    // 此处输出图片的宽高
    console.log('width：' + succ.width + 'px');
    console.log('height：' + succ.height + 'px');
},err => {console.log(err)});
```

上面代码使用 Promise 获取图片的宽高。

### Promise 原生 ajax 操作

```
let getJSON = url => {
    return new Promise(function (resolve, reject) {
        let client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = handler;
        client.responseType = 'json';
        client.setRequestHeader('Accept', 'application/json');
        client.send();

        function handler() {
            if (this.readyState !== 4) return;
            if (this.status === 200) resolve(this.response);
            else reject(new Error(this.statusText));
        }
    });
};

// 调用豆瓣 api（测试时请不要跨域，需要在同一个域名下）
let api = 'https://api.douban.com/v2/book/1220562';
getJSON(api).then(json => {
    console.log(json)
},err => {console.log(err)});
```

上面代码示例了如何使用 Promise 进行原生 ajax 操作

### Promise 的嵌套使用

```
let p1 = new Promise((resolve, reject) => {
    setTimeout(() => reject('fail'), 3000);
});

let p2 = new Promise((resolve, reject) => {
    setTimeout(() => resolve(p1), 1000);
});

p2.then(
    result => console.log(result),
    error => console.log(error)
);
```

上面的代码中，p1 和 p2 都是 Promise 的实例，且 p2 的 resolve 方法将 p1 作为参数，即一个异步操作的结果是返回给另一个异步操作。此时 p1 的状态会传递给 p2，若是 p1 的状态为 pending 那么 p2 就会等待 p1 的状态改变后改变。若是 p1 的状态已经是 resolved 或是 rejected，那么 p2 的回调函数会立即执行。  
上面的代码中，p2 的状态由 p1 决定，1秒之后，p2 调用 resolve 方法，但是此时 p1 状态还未改变，故而 p2 的状态也不会改变，再过了 2 秒，p1 的状态变为 rejected，p2 的状态也跟着变成了 rejected

## Promise.prototype.then

Promise 实例具有 then 方法，它的作用是为：  

1. Promise 实例添加状态改变时的回调函数。then 方法的第一个参数是 Resolved 状态的回调函数，第二个参数(可选)是 Rejected 状态的回调函数
2. then 方法返回的是一个新的 Promise 实例(不是原来那个 Promise 实例)，因此可以采用链式写法。then 后可继续跟 then

### 第一个 then 实例

```
getJSON('/api/test.json').then(function (post) {
    return post.commentURL;
}).then(
    // ... 此处对返回的 post.commentURL 继续进行加工
);
```

上面的例子中第一个 then 方法返回后可以将值传递给下一个 then 方法继续进行加工

### then 方法返回的可以是另一个 then 方法

```
// 最初写法
getJSON('/api/test.json').then(function (post) {
    return getJSON(post.commentURL);
}).then(
    function funcA(comments) {
        console.log(comments)
    },
    function funcB(err) {
        console.log(err)
    }
);

// 简写
getJSON('/api/test.json').then(
    post => getJSON(post.commentURL)
).then(
    comment => console.log(comment),
    err => console.log(err)
);
```

上面的例子中 then 方法返回的是一个新的 Promise 对象，这时，第二个 then 方法指定的回调函数就会等待这个新的 Promise 对象状态发生改变。如果变为 Resolved 则执行第一个回调 funcA，如果变为 Rejected 则调用第二个回调 funcB

## Promise.prototype.catch
Promise.prototype.catch 方法是 .then(null, rejection) 的别名，用于指定错误发生时的回调函数

### Promise.prototype.catch 的语法

```
// 原始写法
getJSON('/api/test.json').then(
    // success, resolve
).catch(err => {
    // 处理前一个回调函数返回的错误
});

// 等价写法
getJSON('/api/test.json').then(
    // success, resolve
).then(null, err => {
    // 处理前一个回调函数返回的错误
});
```

上面的例子中 getJSON 方法返回的是一个 Promise 对象，如果该异步抛出错误，则状态会变为 rejected ，则会调用 catch 方法指定的回调函数处理这个错误

### 第一个 catch 例子

```
let promise = new Promise(function () {
    throw new Error('error');
});
// 输出：错误日志
promise.catch(err => console.log(err));


let promise = new Promise(function (resolve, reject) {
    reject(new Error('error'));
});
// 输出： 错误日志
promise.catch(err => console.log(err));
```

上面的例子中，Promise 抛出一个错误，或是调用了 reject 方法，就会被 catch 方法指定的回调函数所捕获

### 若是 Promise 的状态已经为 Resolved，则之后抛出的异常无效

```
let promise = new Promise((resolve) => {
    resolve('ok');
    // 此时抛出异常等于没有抛出
    throw new Error('test');
});

// 仅仅输出字符串：ok
promise.then(succ => console.log(succ))
       .catch(err => console.log(err));
```

上面的代码中，Promise 在 resolved 之后抛出的异常，并不会被 catch 所捕获，等于没有抛出

### Promise 抛出的错误，具有冒泡性质，会一直向下传递，直到捕获为止(总是会被下一个 catch 捕获)

```
getJSON('/api/test.json').then(function (post) {
    return getJSON(post.commentURL);
}).then(
    function (comments) {
        console.log(comments)
    }
).catch(err => {
    // 此处处理前面三个 promise 产生的错误
});
```

上面的例子中，一共有 3 个 Promise 对象，其中任何一个抛出错误都会被 catch 所捕获

### 更推荐 catch 而不是 reject 回调 (更接近同步写法)

```
promise.then(
    success => { /* success */ },
    error => { /* error */ }
);

// 更加推荐这种形式，更接近同步的写法
promise.then(
    success => { /* success */ }
).catch(error => { /* error */ });
```

上面的例子中，相比于 reject 回调的方式，我们更加推荐写法更加趋近于同步写法的 catch 方式

### 若是没有 catch 方法，Promise 内部抛出的错误无法在外部捕获

```
let f = function () {
    return new Promise(function (resolve) {
        // x 没有申明，会报错
        resolve(x + 2);
    });
};

try {
    // promise 内抛出的异常无法在外部捕获
    f().then(() => {
        // 不执行
        console.log('every thing is great !');
    });
} catch (e) {
    // 不执行
    console.log('promise 外部捕获 !')
}

process.on('uncaughtException', function (err) {
    // 无输出
    console.log(err.stack)
});
```

上面的例子中，f 函数产生的 Promise 对象会报错，但是由于没有指定 catch 方法，因而这个错误不会被捕获，也不会传递到外层代码，导致运行后无任何结果输出。就连 nodejs 全局的异常捕获事件 uncaughtException 都无法捕获到

### serTimeout 会在 Promise 外部抛出异常

```
let promise = new Promise(resolve => {
    resolve('ok');
    setTimeout(() => {
        throw new Error('error')
    }, 0);
});

promise.then(
    success => console.log(success),
    error => console.log(error)
);

process.on('uncaughtException', function (err) {
    // 此处输出错误堆栈信息
    console.log(err.stack)
});
```

上面的例子中，Promise 使用 setTimeout 抛出异常，使得异常是在下一次 “时间循环” 中被抛出的，故而可以正常冒泡到全局，并被全局异常处理事件 uncaughtException 给捕获

### catch 方法返回的仍旧是一个 Promise 对象，可继续跟 then 方法

```
let f = function () {
    return new Promise(resolve => {
        resolve(x / 2);
    });
};

f().catch(err => console.log(err))
    .then(() => {
        // 输出: continue
        console.log('continue')
    });
```

上面的代码抛出异常（x 未定义），被捕获并运行完 catch 代码块,输出错误堆栈信息后会接着执行后面的 then 方法，输出 'continue'

### 若是没有报错，会跳过中途的 catch 方法

```
Promise.resolve().catch(function () {
    // 此句不执行
    console.log('error')
}).then(() => {
    // 输出 continue
    console.log('continue')
});
```

上面的例子中，因为没有报错，故而直接跳过了 catch 代码块，直接执行了后面的 then 方法  
<font color="red">此时若是后面的 then 方法报错，就与之前的 catch 无关了，该异常只能被之后的 catch 块去捕获了 !</font>

### catch 方法中继续抛出异常

```
let f = function () {
    return new Promise(resolve => {
        resolve(x / 2);
    });
};

f().catch(err => {
    // 输出: x is not defined
    console.log(err);
    y + 2;
}).catch(e => {
    // 输出: y is not defined
    console.log(e)
});
```

上面的例子中，第一个 catch 方法在处理了 f 函数返回的 promise 报出的异常后，自身也因为 y 没定义抛出了一个异常。该异常被第二个 catch 方法捕获了，输出了错误堆栈信息

## Promise.all

Promise.all 方法，用于将多个 Promise 实例包装成一个新的 Promise 实例。Promise.all 方法的参数不一定要求必须是数组，但必须是实现了 Symbol.iterator 接口的数据类型，且返回的每一个成员都是 Promise 实例。

### Promise.all 语法

```
let p = Promise.all([p1,p2,p3]);
```

1. p 的状态由 p1, p2, p3 共同决定
2. 只有当 p1, p2, p3 状态都为 Fulfilled 时候，p 的状态才会变为 Fulfilled，此时 p1, p2, p3 的返回值组成一个数组，传递给 p 的回调函数
3. 只要 p1, p2, p3 中有一个被 Rejected 了，此时第一个被 Rejected 的实例的返回值会传递给 p 的回调函数

```
let p1 = new Promise(resolve => {
    setTimeout(resolve, 1000, 'p1')
});

let p2 = new Promise(resolve => {
    setTimeout(resolve, 2000, 'p2')
});

let p3 = new Promise((resolve, reject) => {
    setTimeout(reject, 3000, 'p3 fail');
});

Promise.all([p1, p2]).then(
    // 输出 ['p1', 'p2']
    success => console.log(success),
    error => console.log(error)
);

Promise.all([p1, p2, p3]).then(
    success => console.log(success),
    // 输出 Fail: p3 fail
    error => console.log(`Fail: ${error}`)
);
```

上面的例子中，有三个 Promise 实例，其中，p1, p2 的最终状态都为 resolved，只有 p3 的最终状态为 rejected。故而第一次调用 Promise.all 方法时因为参数只有 p1,p2 且皆为 resolved 状态，故而返回 p1,p2 的结果数组 ['p1','p2']。第二次调用 Promise.all 方法时，由于加入了最终状态为 rejected 的 p3，故而最终 p3 的异常信息，被当做参数传递给了最终结果

### 作为参数的 Promise 实例若是拥有自己的 catch 方法，被 rejected 后，不会触发 Promise.all 的 catch 方法，且 catch 后返回的状态是 resolved

```
const p1 = new Promise((resolve) => {
    resolve('hello');
});

const p2 = new Promise(() => {
    throw new Error('报错了');
}).catch(e => e);

// 输出：["hello", Error: 报错了]
Promise.all([p1, p2])
    .then(result => console.log(result))
    .catch(e => console.log(`外部捕获: ${e}`));
```

上面的例子中，Promise 实例 p2 虽然抛出错误被 rejected 了，但是其自带 catch 方法，并且该 catch 方法返回的是一个新的 Promise 实例，p2 实际上的指向的就是该实例。当 catch 函数体执行完毕后，该实例 (p2) 的状态变成 resolved。导致 Promise.all 接收的两个参数的状态都是 resolved。因此不会去执行它的 catch 方法

## Promise.race
和 Promise.all 一样 Promise.race 方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例

### Promise.race  语法

```
let p = Promise.race([p1,p2,p3]);
```

用途：只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数

### 第一个 Promise.race 例子

```
let p1 = new Promise(resolve => {
    setTimeout(resolve, 1000, 'p1')
});

let p2 = new Promise(resolve => {
    setTimeout(resolve, 500, 'p2')
});

Promise.race([p1, p2]).then(
    success => console.log(success),
    error => console.log(error)
);

```

上面的例子中，因为 p2 先于 p1 改变状态，故而 p2 的返回值字符串 'p2' 就传递给了 Promise.race 的回调函数，作为其参数

### Promise.race 处理 ajax 请求超时

```
let p = Promise.race([
  fetch('/api'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);
p.then(response => console.log(response));
p.catch(error => console.log(error));
```

我们可以使用 Promise.race 来对一个请求进行超时处理，若是 5 秒之内不返回，变会触发变量 p 的 catch 方法( 状态变为 rejected )。可以用于处理 ajax 请求超时

## Promise.resolve
Promise.resolve 可以将现有对象转为 Promise 对象

### Promise.resolve 语法

```
let p1 = Promise.resolve('hello');
// 等价于
let p2 = new Promise(resolve => 'hello');
```

Promise.resolve方法的参数分成以下四种情况：  

+ 参数是一个 Promise 实例 ( 如果参数是 Promise 实例，那么Promise.resolve将不做任何修改 )
+ 参数是一个thenable对象 ( thenable对象指的是具有then方法的对象， Promise.resolve 方法会将这个对象转为 Promise 对象，然后就立即执行 thenable 对象的 then 方法。)

```
let thenable = {
    then: function(resolve) {
        console.log('enter !');
        resolve('Hello World');
    }
};

// 执行此句时输出 'enter !'
// 证明 Promise.resolve 在转化 thenable 对象过程中会自动调用该 thenable 的 then 方法
let p1 = Promise.resolve(thenable);

p1.then(function(value) {
    // 输出：Hello World
    console.log(value);
});
```
上面的例子中，thenable 对象经过 Promise.resolve 处理后变成了一个 Promise 的实例(处理过程中自动调用 then 方法)

+ 参数不是 thenable 对象

```
let p = Promise.resolve('Hello');

p.then(function (s){
  // 输出：'Hello'
  console.log(s)
});
```

上面的例子中，参数 'Hello' 是一个字符串，故而 Promise.resolve 方法会返回一个新的 Promise 对象，状态为resolved

+ 不带有任何参数(返回一个resolved状态的 Promise 对象)

### 立即 resolve 的 Promise 对象，是在本轮 "时间循环" 结束时执行

```
setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('two');
});

console.log('one');

// one
// two
// three
```

上面例子中，先输出 one 再输出 two，证明立即 resolve 的 Promise 对象 是在本轮时间的结束时执行，否则 two 就会输出在 one 的前面。同时，three 是在下一轮事件执行，故而输出在最后

## Promise.reject
Promise.reject()方法也会返回一个新的 Promise 实例，该实例的状态为 rejected

### Promise.reject 语法

```
let p = Promise.reject('error');
// 等同于
let p = new Promise((resolve, reject) => reject('error'))

p.then(null, function (s) {
  // 输出： error
  console.log(s)
});
```

### Promise.reject 方法的参数，会原封不动地变为 catch 的参数

```
let thenable = {
  then(resolve, reject) {
    reject('error');
  }
};

Promise.reject(thenable)
.catch(e => {
  // 输出：true
  console.log(e === thenable)
})
```

上面的例子中，thenable 本身被作为参数传递给了 catch，这与 Promise.resolve 不同，Promise.resolve 传递的参数可以手工指定

## Promise 自定义的附加方法

### done 方法
不管以then方法或catch方法结尾，要是最后一个方法抛出错误，都有可能无法捕捉到（因为 Promise 内部的错误不会冒泡到全局）。因此，我们可以提供一个done方法，总是处于回调链的尾端，保证抛出任何可能出现的错误

```
Promise.prototype.done = function (onFulFilled, onRejected) {
    this.then(onFulFilled, onRejected).catch(function (reason) {
        setTimeout(()=>{throw reason}, 0)
    })
};

// 参开用法
asyncFunc().then().done();
```

### finally 方法
finally 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作

```
Promise.prototype.finally = function (callback) {
    let p = this.constructor;
    return this.then(
        value => p.resolve(callback()).then(() => value),
        reason => p.resolve(callback()).then(() => { throw reason })
    );
};

server.listen(0).then(()=>{
    // ... some code
}).finally(server.stop);
```

## Promise 的实际应用举例

### 使用 Promise 加载图片

```
let loadImageAsync = url => {
    return new Promise(function (resolve, reject) {
        let image = new Image();
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
    });
};
```

### Generator 函数与 Promise 的结合（自动迭代器）

```
function getF() {
    return new Promise(function (resolve) {
        resolve('f');
    })
}

let g = function* () {
    try {
        let foo = yield getF();
        console.log(foo);
    } catch (e) {
        console.log(e)
    }
};

function run(generator) {
    let it = generator();

    function go(result) {
        if (result.done) return result.value;
        return result.value.then(function (value) {
            return go(it.next(value))
        }, function (error) {
            return go(it.throw(error))
        })
    }

    go(it.next());
}

// 输出：f
run(g);
```