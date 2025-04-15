---
title: NodeJS 事件循环 (第二章) 翻译稿
date: 2018-10-07 21:42:00
tags: [nodejs,翻译]
categories: [nodejs,翻译]
comments: true

---

![原文地址: https://jsblog.insiderattack.net/timers-immediates-and-process-nexttick-nodejs-event-loop-part-2-2c53fd511bb3](https://img.shenyujie.cc/2018-10-7-event-loop-2-cover.jpg)
在上一篇文章中，我们对 NodeJs 的事件循环机制已经有了一些大体的了解。在本章中，我们来结合例子，对前文中提到过的 timers, immediates 和 next tick queue 队列 ( 由 process.nextTick 产生 ) 做出详细的分析。

<!--more-->

## 往期文章导航
+ [事件循环总览](//www.shenyujie.cc/2018/10/07/event-loop-1/)
+ Timers, Immediates and Next Ticks (本篇文章)
+ [Promises, Next-Ticks and Immediates](//www.shenyujie.cc/2018/10/07/event-loop-3/)
+ [Handling I/O](//www.shenyujie.cc/2018/10/07/event-loop-4/)
+ [事件循环的最佳实践](//www.shenyujie.cc/2018/10/07/event-loop-5/)

## Next Tick Queue

首先我们再来看一下事件循环图例：
![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-5.png)

next tick queue 队列与其他 4 个主队列区分展示的原因是因为：next tick queue 队列是由 Node 本身提供的，而非 libuv 原生提供。

当每一个事件循环阶段（ timers queue, IO events queue, immediates queue, close queue ）开始执行前，都会先去检查 next tick queue 队列中是否有待处理的事件，直到处理完 next tick queue 队列中的所有事件之后才会转入主要事件循环阶段。

当我们频繁或递归地使用 process.nextTick 方法往 next tick queue 队列中塞入事件时，将会引起 I/O 或是其他队列中的事件处于饿死状态，永远无法得到执行。我们举一个简单的例子，验证这个问题。

```
const fs = require('fs');

function addNextTickRecurs(count) {
    let self = this;
    if (self.id === undefined) {
        self.id = 0;
    }

    if (self.id === count) return;

    process.nextTick(() => {
        console.log(`process.nextTick call ${++self.id}`);
        addNextTickRecurs.call(self, count);
    });
}

addNextTickRecurs(Infinity);
setTimeout(console.log.bind(console, 'omg! setTimeout was called'), 10);
setImmediate(console.log.bind(console, 'omg! setImmediate also was called'));
fs.readFile(__filename, () => {
    console.log('omg! file read complete callback was called!');
});

console.log('started');
```

上述的例子，我们可以预想到，程序会一直执行 process.nextTick 回调，而 setTimeout, setImmediate 和 fs.readFile ( file I/O )  的回调函数则永远得不到执行。

```
started
process.nextTick call 1
process.nextTick call 2
process.nextTick call 3
process.nextTick call 4
process.nextTick call 5
process.nextTick call 6
process.nextTick call 7
process.nextTick call 8
process.nextTick call 9
process.nextTick call 10
process.nextTick call 11
process.nextTick call 12
....
```

我们可以为 addNextTickRecurs 函数设定一个递归值最大深度值，则其余事件循环阶段的事件将在 nextTick 执行完后得到执行。( NodeJs v0.12 版本之前，可以使用 process.maxTickDepth 来设定 next tick queue 队列的最大深度 maxTickDepth 来预防 I/O 饿死的情况发生 )

## Timers queue 定时器队列

当我们使用 setTimeout 或 setInterval 创建一个定时器时，NodeJs 会将这个定时器加入由 libuv 提供的计时器堆。当事件循环执行到 timer queue 阶段，NodeJs 会去计时器堆里寻找到期的 timer/intervals 定时器，并立即执行其绑定的回调函数 （ 事件 ）。若存在多个到期的定时器，则按顺序依次执行。

一个设有特定 timeout 时长的 timer/interval 定时器，在到期后并不能保证一定会被立即执行。这和系统的性能也有一定的关系，因为在执行定时器的回调函数之前，Node 会消耗一定的时间去检查定时器是否到期。同样地，当前事件循环中正在执行的进程，也会对定时器的执行产生影响，过期时间仅能保证，定时器不会在给定的到期事件内触发。下面我们举一个简单的例子验证一下：

```
const start = process.hrtime();

setTimeout(() => {
    const end = process.hrtime(start);
    console.log(`timeout callback executed after ${end[0]}s and ${end[1]/Math.pow(10,9)}ms`);
}, 1000);
```

上面的程序会新建一个过期时间为 1000 毫秒的定时器，并监测回调函数执行时候的时间。重复运行多次该程序，我们会发现每一次定时器回调执行的时机都不一样，且没有一个定时器是在 1s 后正正好好立即执行的，下面是输出结果：

```
timeout callback executed after 1s and 0.006058353ms
timeout callback executed after 1s and 0.004489878ms
timeout callback executed after 1s and 0.004307132ms
...
```

定时器执行的时机，基本都要滞后于设定的 timeout 超时时间。  

需要注意的是，当 setTimeout 和 setImmediate 一起使用时，定时器的这种特性，会造成不可预知的结果，我们会在下文举例说明。

## Immediates Queue
尽管 Immediates 队列和定时器在行为表现上很相近，但是其也有自己的特点。和定时器不同的是，我们不能指定 setImmediate 回调函数执行的时机，只能保证其在事件循环的 I/O 阶段结束之后会被立即处理。我们可以用下面的方法，为 immediates queue 队列，新增一个事件（ setImmediate 的回调函数 ）：

```
// 为 immediates queue 队列新增一个 immediates 事件 
setImmediate(() => {
   console.log('Hi, this is an immediate');
});
```

## setTimeout vs setImmediate
我们看一下上文的事件循环机制的图示可以发现，当程序运行时，Node 会先去处理 timer queue 队列，其后当处理完 I/O 队列之后，Node 会去处理 Immediates 队列。依照上面的时间循环机制图例，我们可以很容易确定下面的程序输出结果：

```

setTimeout(function() {
    console.log('setTimeout')
}, 0);
setImmediate(function() {
    console.log('setImmediate')
});
```


按照我们的猜想，由于 setTimeout 属于 timer 队列，执行顺序必然优先于 setImmediate 的 immediate 队列，所以必定先输出 setTimeout。但是实际情况下，这个程序的输出顺序不是固定的，有时 timer 队列先执行，有时 immediate 先执行，每次运行的结果都有可能不同。

这是因为，在上述例子中，定时器 timer 的过期时间设置为 0，但是 Node 无法严格保证，该定时器会在 0 秒后一定会被立即执行。由于这个原因，当事件循环启动时，Node 可能无法检测到即将过期的定时器，而转入到了 I/O 阶段，继而转入到 immediate 队列阶段，执行 immediate 队列中的事件。再下一轮事件循环中，Node 检测到了 timer queue 队列，执行了 setTimeout 的回调函数。故而造成了时而 setImmediate 执行顺序先于 setTimeOut ( 0s ) 的情况。  

然而，我们看下面的例子，则一定能保证 immediate 队列中的事件( setImmediate 回调函数 ) 一定会先于 timer 队列中的事件 ( setTimeout, setInterval 注册的回调函数 ) 被执行。

```
const fs = require('fs');

// __filename 填写具体文件路径
fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout')
    }, 0);
    setImmediate(() => {
        console.log('immediate')
    })
});

输出:
immediate
timeout
```

让我们分析下上述程序的执行流程：

1. 首先，该程序会使用 fs.readFile 异步方法读取一个文件，文件读取完成后，传入该方法上的回调函数将会被触发
2. 此时事件循环开始
3. 当文件开始读取时，Node 将会把传入 fs.readFile 的回调函数塞入 I/O 事件队列中。
4. 由于此时没有其他事件要处理，Node 将会等待 I/O 操作完成，然后处理 I/O 队列中的 read 事件  ( 回调函数 )
5. 此时开始处理 read I/O 的回调函数，在该回调函数中，一个 timer 事件 ( 由 setTimeout 产生 ) 被加入了计时器堆 ( timer 队列 )，一个 immediate 事件( 由 setImmediate 产生 )被加入了 immediate 队列。
6. 当前 I/O 事件处理完成后，由于 I/O 队列中没有其余事件要处理，时间循环机制进入 immediate 阶段，开始处理 immediate 队列中的事件，输出: immediate
7. 在下一轮事件循环周期中，Node 事件机制继续首先检查 timer 队列中的事件，此时，之前的 timer 事件就被执行并输出：timeout

## 总结
下面我们来举个总体的例子来看下，在事件周期的各个阶段，每一个阶段的事件队列是如何一起协同工作的。

```
setImmediate(() => console.log('this is set immediate 1'));
setImmediate(() => console.log('this is set immediate 2'));
setImmediate(() => console.log('this is set immediate 3'));

setTimeout(() => console.log('this is set timeout 1'), 0);
setTimeout(() => {
    console.log('this is set timeout 2');
    process.nextTick(() => console.log('this is process.nextTick added inside setTimeout'));
}, 0);
setTimeout(() => console.log('this is set timeout 3'), 0);
setTimeout(() => console.log('this is set timeout 4'), 0);
setTimeout(() => console.log('this is set timeout 5'), 0);

process.nextTick(() => console.log('this is process.nextTick 1'));
process.nextTick(() => {
    process.nextTick(console.log.bind(console, 'this is the inner next tick inside next tick'));
});
process.nextTick(() => console.log('this is process.nextTick 2'));
process.nextTick(() => console.log('this is process.nextTick 3'));
process.nextTick(() => console.log('this is process.nextTick 4'));
```

上述程序执行后，以下事件被添加到相应的事件队列中。

1. 3 个 immediates 事件
2. 5 个 timer 事件
3. 5 个 next tick 事件

程序输出结果:

```
this is process.nextTick 1
this is process.nextTick 2
this is process.nextTick 3
this is process.nextTick 4
this is the inner next tick inside next tick
this is set timeout 1
this is set timeout 2
this is set timeout 3
this is set timeout 4
this is set timeout 5
this is process.nextTick added inside setTimeout
this is set immediate 1
this is set immediate 2
this is set immediate 3
```

让我们分析一下上述程序的执行流程:

1. 当事件循环启动时，事件循环机制在进入 timer queue 阶段前，会去先检测 intermediate queue ( 由 next tick queue 和 microtasks queue 组成 )，发现了 next tick queue 中有有待执行的事件，便立即处理。在处理到第二个 next tick 事件时，一个新的 next tick 事件被加入了 next tick queue 队列的末尾，并在 next tick queue 队列的最后被执行并输出。
2. 事件循环机制进入 timer queue 事件阶段，执行 time queue 队列中的 timer 事件。当执行到第二个 timer 事件 ( 回调 ) 时，一个 next tick 事件被加入了 next tick queue 队列。
3. 处理完 timer queue 阶段，准备进入 I/O queue 阶段之前，事件机制仍然会先去检查 intermediate queue 中是否有待执行的事件，发现了，刚才插入 next tick queue 中的事件并执行，输出：this is process.nextTick added inside setTimeout
4. 由于此时 I/O queue 和 intermediate queue 队列中都没有待执行的事件，事件循环机制进入 immediates queue 阶段，并执行其中的事件。

在下一章节中，我们将详细讨论，next tick callback ( 事件 ) 和 promise 相关内容。欢迎大家对本章内容提出意见，批评指正~