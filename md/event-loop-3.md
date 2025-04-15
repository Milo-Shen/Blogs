---
title: NodeJS 事件循环 (第三章) 翻译稿
date: 2018-10-07 21:43:00
tags: [nodejs,翻译]
categories: [nodejs,翻译]
comments: true

---

![原文地址: https://jsblog.insiderattack.net/promises-next-ticks-and-immediates-nodejs-event-loop-part-3-9226cbe7a6aa](https://img.shenyujie.cc/2018-10-7-event-loop-3-cover.jpg)

欢迎回到事件循环系列文章，在第一章中，我们对 NodeJs 的事件循环以及事件循环的各个阶段有了一个总体的了解。在第二章中，我们学习了 timer、immediates 队列在事件循环中的特性和运作机制。在本章中，我们将要研讨事件循环机制是如何处理 resolved/rejected promise，以及 next tick 事件（回调函数）。若是你对 promise 还不熟悉，建议可以先学一下 promise 的语法。由于下文中的事件和回调函数是等价的，所以下文中提到的事件就是回调函数。

<!--more-->

## 往期文章导航
+ [事件循环总览](//www.shenyujie.cc/2018/10/07/event-loop-1/)
+ [Timers, Immediates and Next Ticks](//www.shenyujie.cc/2018/10/07/event-loop-2/)
+ Promises, Next-Ticks and Immediates(本篇文章)
+ [Handling I/O](//www.shenyujie.cc/2018/10/07/event-loop-4/)
+ [事件循环的最佳实践](//www.shenyujie.cc/2018/10/07/event-loop-5/)

## 原生 promise 
原生 promise 被看做是一个微任务 ( microtask ) ，并且存储于微任务事件队列 (microtask queue) 中，该队列在 next tick queue 队列执行完毕后执行。
![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-5.png)

我们来举个例子说明：

```
Promise.resolve().then(() => console.log('promise1 resolved'));
Promise.resolve().then(() => console.log('promise2 resolved'));
Promise.resolve().then(() => {
    console.log('promise3 resolved');
    process.nextTick(() => console.log('next tick inside promise resolve handler'));
});
Promise.resolve().then(() => console.log('promise4 resolved'));
Promise.resolve().then(() => console.log('promise5 resolved'));
setImmediate(() => console.log('set immediate1'));
setImmediate(() => console.log('set immediate2'));

process.nextTick(() => console.log('next tick1'));
process.nextTick(() => console.log('next tick2'));
process.nextTick(() => console.log('next tick3'));

setTimeout(() => console.log('set timeout'), 0);
setImmediate(() => console.log('set immediate3'));
setImmediate(() => console.log('set immediate4'));
```

在上述例子中，我们进行了如下操作：

1. 往微任务队列 ( microtask queue ) 中加入了 5 个微任务事件 ( microtask )，需要注意的是，此处我们加入的微任务都是 resolved 回调
2. 使用 setImmediate 往 immediate queue 队列中加入了 2 个事件
3. 往 next tick queue 队列中加入了3个事件
4. 创建了一个 timeout 为 0s 的定时器，为 timer queue 队列中加入了一个 timer 事件
5. 往 immediate queue 队列中又加入了 2 个 immediate 事件 

输出结果： 

```
next tick1
next tick2
next tick3
promise1 resolved
promise2 resolved
promise3 resolved
promise4 resolved
promise5 resolved
next tick inside promise resolve handler
set timeout
set immediate1
set immediate2
set immediate3
set immediate4
```
执行步骤如下：

1. 事件循环机制首先会去检查 next tick 队列，然后 Node 将会处理其中的事件，直到队列为空。( 上述例子中有 3 个 next tick 事件 )
2. 事件机制将会检测 microtask queue 队列，执行其中的事件，直到队列为空。( 上述例子中有 5 个 promise resolved 事件 )
3. 当处理 microtask queue 队列中的 promise resolved 事件 ( 回调 ) 时， 一个 next tick 事件被加入了 next tick queue 队列 （ promise resolved 回调事件中调用了 process.nextTick 添加 ）
4. 当 microtask queue 队列中的所有事件都执行完毕后，由于之前往 next tick 队列中又塞入了一个事件，事件机制会再去执行 next tick 队列中的所有事件
5. 当 microtask queue 和 next tick queue 队列中都没有额外事件要处理后，事件循环将会转入 timer queue 阶段（上述例子中，此时有 5 个到期的 timer 事件将被依次执行）
6. 执行完 timer queue 队列后，事件循环将会转入 I/O queue 队列，由于本例中，并没有 I/O queue 事件，故而事件循环将会转入 immediate 队列（ 本例中，immediate queue 队列中一共有 4 个事件，将会被依次执行 ）
7. 最后，整个事件循环都没有可供执行的事件，程序退出

> process.nextTick 和 promise 的 resolved/rejected事件同属于 microtasks queue 队列

## Q and Bluebird
现在我们知道了，原生的 resolve/reject 回调函数 ( 即 promise 事件 ) ，在 Node 中是被当做 microtask 处理的，且当事件循环机制从一个事件阶段转移到下一个阶段的当中才会被执行。那么 Q 和 Bluebird 这类第三方库是如何实现 Promise 的呢 ?  

在 Javascript 原生提供 Promise 语法前，我们通常会使用 Q 或是 Bluebird 来实现部署 Promise，然而他们的内部实现原理和原生 Promise 有很大区别。  

在本章成文时候，根据官方文档，Q ( 1.5.1 ) 底层使用 next tick queue 队列 ( 由 process.nextTick 生成 ) 来管理 promise 的 resolved/rejected 回调函数。  

需要注意的是，promise 始终是异步的。由于底层采用了 next tick queue 队列来实现，所以 promise 的 fulfillment/rejection 状态的 resolved/rejected 回调总是会在下一个事件阶段 ( next tick queue 阶段 ) 才会被执行，同时也能保证 then 的回调总是会在其他主要事件阶段之前被执行。  

而 Bluebird ( 当前版本 v3.5.2 ) ，底层使用 setImmediate 来实现部署 promise [详情可见此处](https://github.com/petkaantonov/bluebird/blob/master/src/schedule.js#L12)，下面我们举一个例子来说明，上述 2 种第三方 promise 实现的表现结果:

```
const Q = require('q');
const BlueBird = require('bluebird');

Promise.resolve().then(() => console.log('native promise resolved'));
BlueBird.resolve().then(() => console.log('bluebird promise resolved'));
setImmediate(() => console.log('set immediate'));
Q.resolve().then(() => console.log('q promise resolved'));
process.nextTick(() => console.log('next tick'));
setTimeout(() => console.log('set timeout'), 0);
```

在上面的例子中，由于 BlueBird.resolve().then 是用 setImmediate 实现的，所以他们两个同属于 immediate queue 队列，且本例子中 BlueBird resolved 事件在 setImmediate 前。由于 Q 使用 process.nextTick 实现 promise，所以他们同属于 next tick queue 队列，且本例中，Q 的 promise resolved 事件在 process.nextTick 之前，输出结果如下:  

```
q promise resolved
next tick
native promise resolved
set timeout
bluebird promise resolved
set immediate
```

> 对于 promise 的 reject 回调，上述法则仍旧是有用的

值得一提的是，Bluebird 提供了 setScheduler 方法，来让我们可以手动选择，promise 的底层实现 ( process.nextTick 或是 setImmediate ), 若是我们指定 process.nextTick 来作为 bluebird promise 的底层实现，代码如下：  

```
const BlueBird = require('bluebird');
BlueBird.setScheduler(process.nextTick);
```

若是我们想用 setTimeout 作为 setScheduler 也是可以的，代码如下：

```
const BlueBird = require('bluebird');
BlueBird.setScheduler((fn) => {
    setTimeout(fn, 0);
});
```

使用 setImmediate 来实现 Promise 比使用 process.nextTick 更合理，可以防止产生 I/O starvation ( I/O 饿死 ) 问题。

### 最后一个例子

```
const Q = require('q');
const BlueBird = require('bluebird');

Promise.resolve().then(() => console.log('native promise resolved'));
BlueBird.resolve().then(() => console.log('bluebird promise resolved'));
setImmediate(() => console.log('set immediate'));
Q.resolve().then(() => console.log('q promise resolved'));
process.nextTick(() => console.log('next tick'));
setTimeout(() => console.log('set timeout'), 0);
Q.reject().catch(() => console.log('q promise rejected'));
BlueBird.reject().catch(() => console.log('bluebird promise rejected'));
Promise.reject().catch(() => console.log('native promise rejected'));
```

以上代码输出：

```
q promise resolved
q promise rejected
next tick
native promise resolved
native promise rejected
set timeout
bluebird promise resolved
bluebird promise rejected
set immediate
```

大家可以参考上述文章，结合原理，分析下代码为何输出顺序是上述这样的。

现在我们对 setTimeout, setImmediate, process.nextTick 和 promise 和其执行顺序有了总体的了解。在下一章节，我将详细介绍事件循环机制是如何处理 I/O 操作的，希望大家能度过一个愉快的阅读之旅，也欢迎大家批评指正~
