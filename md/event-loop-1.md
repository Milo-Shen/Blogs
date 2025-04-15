---
title: NodeJS 事件循环 (第一章) 翻译稿
date: 2018-10-07 21:41:00
tags: [nodejs,翻译]
categories: [nodejs,翻译]
comments: true

---

![原文地址: https://jsblog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810](https://img.shenyujie.cc/2018-10-7-event-loop-1-cover.jpg)

I/O 操作的独特性使得 NodeJS 从一众编程语言中脱颖而出。我们经常可以听到 NodeJs 是一门构建在 Google V8 JavaScript 引擎之上，异步，无阻塞，基于事件循环的编程平台。  
那么上述的特征都意味着什么呢？事件循环是回答这一切问题的关键所在。在下面的文章中，我会详细介绍什么是事件循环，事件循环是如何影响我们的 web 应用，我们该如何最大程度地利用好事件循环这个特性。下面我将用一系列的文章来介绍该内容。在第一章中，我们将探讨 NodeJs 的工作原理，处理 I/O 的方式以及 NodeJs 跨平台工作的原理。

<!--more-->

## 往期文章导航
+ 事件循环总览 (本篇文章)
+ [Timers, Immediates and Next Ticks](//www.shenyujie.cc/2018/10/07/event-loop-2/)
+ [Promises, Next-Ticks and Immediates](//www.shenyujie.cc/2018/10/07/event-loop-3/)
+ [Handling I/O](//www.shenyujie.cc/2018/10/07/event-loop-4/)
+ [事件循环的最佳实践](//www.shenyujie.cc/2018/10/07/event-loop-5/)

## Reactor Pattern ( 反应器设计模式 )

NodeJs 由事件分发器 ( Event Demultiplexer ) 和 任务队列 ( Event Queue ) 所驱动。所有的 I/O 操作 ( 磁盘，网络等 ) 都会最终被抽象成一个 ( 完成/失败 ) 的触发器，这种触发器被称为事件。事件的处理基于以下的算法：

1. 事件分发器用于接收 I/O 请求，并且把这些请求分配给合适的硬件处理设备
2. 当某个 I/O 请求处理完成时（ 例如：磁盘 IO, 网络 IO ），事件分发器会为这次 I/O 注册一个用于执行特定操作的回调函数，并把这个回调函数塞入一个队列。这个回调函数就被称为事件，这个装有回调函数的队列就叫做事件队列。
3. 系统会按照先进先出的顺序依次执行事件队列中的回调函数 ( 也称事件 )，直到队列为空。
4. 当事件队列中没有可供处理的事件，或是事件分配器没有额外待分配的请求时，整个程序就执行完成了，否则就事件循环将会从第一步开始继续循环执行。

这个用于协调整个事件机制的过程就被称之为事件循环。

![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-2.jpeg)

事件循环是一个单线程，半无限的循环。称它为半无限是因为在没有额外的事件可供处理时，程序就会结束，不会无限执行下去。

> 不要把事件循环和 NodeJs 中的事件触发器混为一谈，事件触发器和事件循环是两个截然不同的概念。在最后一篇文章中，我将介绍事件触发器对事件处理函数，和事件循环的影响。

上图高度概括了 NodeJs 的工作流程，并且向我们展示了 NodeJs 中的一个核心组件——反应器模式 ( Reactor 设计模式 )，不过真实情况要比这更复杂。

> 事件分配器，事件队列，不仅仅只能产生和存储 I/O 类型的事件，我们讲下下文详细介绍

## 事件分配器 ( Event Demultiplexer )

事件分配器是 Reactor 设计模式中的一个抽象概念。事件分配器在不同的操作系统中有不同的实现，名字也大不相同。例如，例如 linux 系统中的 epoll，mac os 中的 kqueue，Solaris 中的 event ports 和 windows 系统中的 IOCP 等都是事件分配器的实现。NodeJs 借助这些实现来提供底层的，异步的，非阻塞的 I/O 操作功能。

## 文件 I/O 操作的复杂性

然而并非所有的 I/O 操作都可以用上述提到的系统底层来实现，即使是在同一个操作系统上，支持不同类型的 I/O 操作也是一件很困难的事情。网络 I/O 可以用上述 epoll 等来实现，但是文件要明显复杂地多。譬如 Linux，不支持完全异步的文件系统访问。在MacOS系统中，文件系统事件(通知/信号)发送也有限制 [更多信息](https://blog.libtorrent.org/2012/10/asynchronous-disk-io/)。糅合所有这些情形的差异和复杂性，以便提供完整统一的异步操作，是一项非常复杂的任务。

## DNS 的复杂性
由于 Nodejs 提供的 DNS API，譬如 `dns.lookup` 也会涉及到文件 I/O 操作 ( 读取 nsswitch.conf 文件等 ) ，故而文件 I/O 的复杂性就顺延到 DNS 里去了。

## 解决方案

因此 NodeJS 引入了线程池来提供 I/O 功能，使用线程池处理的 I/O 操作不能直接访问底层硬件（譬如: epoll 等）。另外，并非所有的 I/O 操作都是由线程池处理的。NodeJs 将大部分非阻塞，异步的 I/O 都借助 epoll ( linux 下 ) 处理掉了 ，对于那些阻塞的 I/O 或是复杂的 I/O 操作 ( 譬如：File I/O, crypto 操作等 )，则交由线程池来处理。

## 单元小结

诚如我们所见，在现实中，在不同的操作系统上去提供所有不同类型的 I/O ( 文件 io，网络io，dns 等 ) 操作是非常困难的。对于一些类型的 I/O 操作，我们可以使用本机硬件来实现，并保持完全异步。对于特定的 I/O 操作（高复杂度，无法异步，阻塞型），我们就将其放入线程池，来实现异步。

> 开发人员对Node的一个常见误解是，Node在线程池中执行所有的 I/O 操作。

## 关于 libuv
![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-3.png)
下面是关于 libuv 的官方介绍

> libuv 是一个最初为 NodeJs 编写的跨平台支持库。它专门针对异步 I/O 量身定做。针对不同的 I/O 类型和机制，该库用句柄(handles) 和 流(stream) 为套接字(sockets) 等进行了高度的抽象，也同时为 NodeJs 提供了跨平台的 I/O 和线程功能。

下面让我们来看一下 libuv 的构成。下图示来自 libuv 的官网文档，其向我们展示了 libuv 是如何将不用类型的 I/O 映射到同一套统一的 API 的。

![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-4.png)

根据上图我们得知，事件分配器 (Event Demultiplexer) 并不是单独的个体，而是暴露在 NodeJs 上层，一整套由 libuv 提供的 I/O API 的集合。libuv 同时也为 NodeJs 提供了一整套的事件循环和事件队列机制。下面让我们来了解下什么是事件队列

## 事件队列

事件队列是一个在队列为空前，按照先进先出的顺序处理其中事件的一个数据结构。此行为与 Reactor 模式有些出入，那他们的区别在哪呢 ？

1. NodeJs 中包含有多个队列，不同类型的事件在他们各自的队列中排队
2. NodeJs 在处理完一个事件阶段转入下一个阶段之前，事件循环机制会去先处理 intermediate 队列 ( 由 next tick queue 和 microtasks queue 组成) 中的事件，直到队列为空。

那么 NodeJs 中一共有多少个队列，intermediate 队列又是何方神圣呢 ？

## libuv 事件循环机制一共提供了 4 种主要队列 ( 下面叙述的事件概念和回调函数等价 )
1. Expired timers and intervals queue (  由 setTimeout 和 setInterval 到期触发的回调函数，也称事件组成 )
2. IO Events Queue ( 由 IO 事件组成 )
3. Immediates Queue ( 由 setImmediate 注册的事件组成 )
4. Close Handlers Queue ( 由例如 socket.on('close', ...) 等关闭事件的回调函数组成 )

需要注意的是，上面只是对事件队列类型的简单描述，其中一些种类实际上拥有不同的数据结构（ 譬如：定时器 timer，就存放于最小堆中 ）  

除了上述提到的 4 种队列以外，还有 2 种额外的队列，他们隶属于 intermediate queue。这两个队列不由 libuv 提供，而是由 NodeJs 原生提供，他们分别是：

1. Next Ticks Queue ( 由 process.nextTick 注册的回调函数组成 )
2. Other Microtasks Queue 微任务 ( 由譬如：promise 的 resolve 回调函数组成 )

### 事件队列的工作流程
![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-5.png)

如上图所示，NodeJS 首先会去检查定时器队列中的到期定时器事件，启动事件循环。并在当前事件循环周期中遍历每个阶段的事件队列，同时在全局维护，全部事件的引用计数器。在处理完 close queue 队列后，若是所有事件队列中都没有待处理的事件时，事件循环便会终止。（ 事件循环中的每一个事件队列都可被认为是事件循环的一个阶段 ）  

上图用红色标出来的两个 intermediate queue 队列 ( 由 Next Ticks Queue 和 Other Microtasks queue 组成 )。当任意一个事件循环阶段执行完成后，时间循环机制便会检查，next tick queue 和 microtasks queue，并执行其中的事件，执行完毕后，时间循环机制才会转入下一个事件阶段。

> 举个例子，事件循环机制当前正在处理包含了 5 个事件的 immediates queue 队列。与此同时，2 个事件被加入了 next tick queue。那么当事件循环机制处理完 immediates queue 队列中的所有事件并转入下一个 close queue 阶段之前。会先去检查两个 intermediate queue 队列 ( 由 Next Ticks Queue 和 Other Microtasks queue 组成 ) 中是否有可执行的事件（ 本例中检测到 next tick queue 中有 2 个待处理事件 ），执行完成后，才会转入下一个事件阶段也就是 close queue 阶段

## Next tick queue vs Other microtasks queue
虽然 next tick queue 和 other microtasks queue 同属于 intermediate queue，但是 next tick queue 队列的优先级要高于 microtasks queue 队列。当事件循环机制会处理完 next tick queue 队列中的事件之后再去处理 other microtasks queue 队列。

> 需要注意的是，Next tick 优先级高于 promise resolved 事件的情况，只适用于 v8 引擎的情况，其他引擎需要更具其各自的实现来确定。若是您使用了类似 bluebird 或是 q 等第三方库，则上述优先级的顺序则不再适用，这些库对 promise 有各自的有别于 v8 的实现方式。

## IO starvation 问题
IO starvation 问题又名 IO 饿死问题。Intermediate queue 队列的引入带来了这一问题。假设我们不停地使用 process.nextTick 函数，往 Intermediate queue 队列中 ( 此处具体为 next tick queue ) 中追加事件。那么事件循环机制就会无限期地执行 next tick queue 队列中的事件，而其他事件阶段的事件则永远得不到执行，从而造成整个事件循环周期的停顿。这种由于 Intermediate queue 队列 ( 由 Next Ticks Queue 和 Other Microtasks queue 组成 ) 长期无法被清空而造成事件循环无法继续前进的故障就叫做 IO 饿死。

为了避免这个问题，在 NodeJs 0.12 版本之前，我们可以使用 process.maxTickDepth 参数，设置 next tick 队列的最大深度。后续 NodeJs 版本中，由于各种原因移除了这个方法。

全文最后，相信大家应该对事件循环的定义，实现，和其处理异步 I/O 的方式有了一个大致的了解。下面图例展示了 Libuv 在整个 nodejs 架构中的位置。

![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-6.png)

热衷希望大家能对本文提出意见，在下面的文章中，我还将介绍：

1. Timers, Immediates 和 process.nextTick 
2. Resolved Promise 回调 和 process.nextTick 
3. 如何处理 I/O
4. 事件循环的最佳实践