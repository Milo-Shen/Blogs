---
title: NodeJS 事件循环 (第四章) 翻译稿
date: 2018-10-07 21:44:00
tags: [nodejs,翻译]
categories: [nodejs,翻译]
comments: true

---

![原文地址: https://jsblog.insiderattack.net/handling-io-nodejs-event-loop-part-4-418062f917d1](https://img.shenyujie.cc/2018-10-7-event-loop-4-cover.jpg)

欢迎回到事件循环专题，在这一章节，我们将详细讨论 NodeJS 是如何处理 I/O 操作的。与此同时，还将探讨事件循环机制的实现原理，以及 I/O 操作是如何与其他异步操作协同工作的。没有看过前几章文章的同学建议回看一下~

## 往期文章导航
+ [事件循环总览](//www.shenyujie.cc/2018/10/07/event-loop-1/)
+ [Timers, Immediates and Next Ticks](//www.shenyujie.cc/2018/10/07/event-loop-2/)
+ [Promises, Next-Ticks and Immediates](//www.shenyujie.cc/2018/10/07/event-loop-3/)
+ Handling I/O(本篇文章)
+ [事件循环的最佳实践](//www.shenyujie.cc/2018/10/07/event-loop-5/)

## Async I/O (异步 I/O)
在 NodeJS 中，I/O 操作通常都是异步的，虽然 NodeJS 也会提供同步版本的 API。

![](https://img.shenyujie.cc/018-10-5-event-loop-part-four-2.jpeg)

在各类操作系统的实现中，他们都为异步 I/O 提供事件通知接口（ linux 中的 epoll，mac os 中的 kqueue，solaris 中的 event ports，windows 中的 IOCP ）。NodeJS 正是利用这些系统级别的事件通知机制来实现无阻塞的异步 I/O。  

正如我们所见，NodeJS 是一组实用程序和系统实现的聚合，它们共同构成了 NodeJS 这个高性能的编程框架。其组成部分包括:  

1. Chrome v8 engine 高性能 JavaScript 引擎
2. 构建在 libuv 上的事件循环和异步 I/O
3. c-ares 提供 DNS 操作
4. 其他插件，譬如：http-parser, crypto, zlib)

![](https://img.shenyujie.cc/2018-10-5-event-loop-part-four-3.png)

在这一章节中，我们将讨论 Libuv 是如何为 NodeJS 提供异步 I/O 的功能的，下面让我们再回顾一下，事件循环周期的图示：

![](https://img.shenyujie.cc/2018-9-29-event-loop-part-one-5.png)

让我们来回顾一下，至今为止，我们对事件循环的了解 ( 以下只讨论 4 个主要事件循环流程 )：

1. 事件循环机制开启，会先去检查 timer queue，并执行其中到期的事件
2. NodeJS 会去处理 I/O queue 中挂起的 I/O 事件，并选择性地等待挂起的 I/O 完成
3. 其后会处理 immediates queue 中的事件
4. 最后，NodeJS 会处理 I/O Close 事件
5. 每一个主要事件循环阶段执行完成后，libuv 会将处理结果传递给上层 JavaScript 引擎，以供处理。

需要注意的是，当进入上述每一个主循环之前，NodeJS 都会先去检查并执行 intermediate queue ( 由 next tick queue 和 microtasks queue 组成 ) 中的事件。

下面我们正式开始探究，NodeJS 如何在其事件循环中执行 I/O 操作。

## 什么是 I/O
通常，任何涉及到非 CPU 以外的外部设备的工作都称为 I/O，最典型的 I/O 操作就是文件 IO 和 网络 IO ( PS：TCP/UDP )

## Libuv 与 NodeJS I/O
NodeJS 本身没有执行异步 I/O 的功能，是由 libuv 提供的。libuv 最初设计只为 NodeJS 提供异步 I/O，但是现在可以脱离 NodeJS 独立使用了。libuv 为 NodeJS 屏蔽了不同系统平台原生 I/O 操作的复杂性，并为上层 JavaScript 提供了一套平台无关的，统一的异步 I/O API。

## 下文的阅读建议
1. 推荐同学们，先阅读下，先前关于事件循环的一系列文章，下文中，我们将会把主要精力都放在阐述 NodeJS 的 I/O 操作上，事件循环的部分将不再再次赘述
2. 下面的例子中会包含一部分运行在 unix 平台上的 libuv 源码，windows 下会略有差异。
3. 下面的例子中，会出现一些 C 代码，但是不会很难，对最基本的程序流程有所了解即可。

正如我们在上面的图示中看到的，libuv 处在 NodeJS 框架的底层，现在让我们来看下 NodeJS 框架上层和 libuv 事件循环的阶段之间的关系，请看下图：

![](https://img.shenyujie.cc/2018-10-5-event-loop-part-four-4.jpeg)

在本文的第三章图示（ 事件循环 ）中，事件循环一共列举了 4 个主要阶段，但是涉及到 libuv 后，一共增加到了 7 个事件循环，他们分别是：

1. Timers —— 到期的 setTimeout 或是 setInterval 事件（ 回调函数 ）
2. Pending I/O callbacks —— 处理挂起的 I/O 请求（ 除了 setTimeout, setInterval, setImmediate 和类似 socket.on('close', ...) 等 io close 事件，其他事件都在这个阶段执行 ）
3. Idle handlers —— 执行 libuv 内部操作，和开发者无关，可忽略
4. Prepare Handlers —— 为轮训 I/O 操作做准备工作，和开发者无关，可忽略
5. Check handlers —— I/O 轮训完成后做一些事后分析工作，同时 setImmediate 的回调函数也在此处执行
6. Close handlers —— 执行关闭请求的回调函数(事件)，譬如：`socket.on('close', ...)`

看到此处，若是您还对第一章中的内容还留有印象，您肯定会有如下疑问：

1. 什么是 Check handlers ？
2. 什么是 I/O Pollin，为何执行完 I/O 回调后，要阻塞 I/O，NodeJS 不是无阻塞的吗 ？

## Check Handlers
当初始化 NodeJS 时，其会将所有 setImmediate 回调(事件)注册为 libuv 中的 check handlers。这实际上意味着 setImmediate 的回调函数将会最终送入 libuv 的 check handles queue 队列，该队列保证在事件循环的 I/O 阶段后得到执行。

## I/O Polling
现在你肯定想知道 I/O 轮训是什么，它和 I/O queue 到底有什么关系。虽然上面的图示中，我将 I/O queue ( IO 回调队列 ) 和 I/O polling 轮询合并成事件轮询的单个阶段，但实际上，I/O 轮询是发生在 I/O queue 之后的。  

需要注意的是，I/O polling 轮询是可选的，在某些情形下，I/O polling 将会发生或不发生。为了彻底理解这一点，我们来看下 libuv 是如何实现的：

```
r = uv__loop_alive(loop);
  if (!r)
    uv__update_time(loop);

while (r != 0 && loop->stop_flag == 0) {
    uv__update_time(loop);
    uv__run_timers(loop);
    ran_pending = uv__run_pending(loop);
    uv__run_idle(loop);
    uv__run_prepare(loop);

    timeout = 0;
    if ((mode == UV_RUN_ONCE && !ran_pending) || mode == UV_RUN_DEFAULT)
      timeout = uv_backend_timeout(loop);

    uv__io_poll(loop, timeout);
    uv__run_check(loop);
    uv__run_closing_handles(loop);

    if (mode == UV_RUN_ONCE) {
      uv__update_time(loop);
      uv__run_timers(loop);
    }

    r = uv__loop_alive(loop);
    if (mode == UV_RUN_ONCE || mode == UV_RUN_NOWAIT)
      break;
}
```

上面的代码是 libuv 源码 core.c 文件下 uv_run 方法的代码，也是 NodeJS 事件循环的实现核心。下面让我们结合上文加入了 libuv 的事件循环图来阅读上述代码:

### 了解总体结构

1. uv__loop_alive —— 检查是否有任何被引用的 handler 被调用，或是任何活动的操作被挂起
2. uv__update_time —— 用于标识过期定时器，该操作会通知系统更新事件循环的当前时间
3. uv__run_timers —— 执行到期的 timers 定时器的回调函数
4. uv__run_pending —— 执行所有 I/O 回调函数(completed,orrored)
5. uv__io_poll —— 进行 I/O 轮询
6. uv__run_check —— 执行所有 check handlers 和 setImmediate 回调函数
7. uv__run_closing_handles —— 执行所有 close 事件，譬如：`socket.on('close', ...)`

## uv__loop_alive 函数

首先实现循环机制会先去检查事件循环本身是否还活着，这是通过调用 uv__loop_alive 函数来检查的，这个函数的实现很简单，如下：

```
static int uv__loop_alive(const uv_loop_t* loop) {
  return uv__has_active_handles(loop) ||
         uv__has_active_reqs(loop) ||
         loop->closing_handles != NULL;

```

uv__loop_alive 函数返回一个 bool 值，若是返回 true，证明循环还活着，true 的条件如下：

1. 有待调用的活动的句柄 ( handles )
2. 有挂起的请求
3. 有挂起的 closing 操作，譬如 `socket.on('close', ...)` 回调

只要 uv__loop_alive 返回 true，事件循环便会继续执行。  

## uv__run_pending 函数
在执行完所有到期的 timer queue 队列中的事件之后，uv__run_pending 函数就会被触发。该函数将遍历 libuv 事件中存储在 pending_queue 队列里完成的I/O操作。若是 pending_queue 队列为空，则该函数返回 0，否则将执行 pending_queue 队列中所有的回调函数，并返回 1。

```
static int uv__run_pending(uv_loop_t* loop) {
  QUEUE* q;
  QUEUE pq;
  uv__io_t* w;

  if (QUEUE_EMPTY(&loop->pending_queue))
    return 0;

  QUEUE_MOVE(&loop->pending_queue, &pq);

  while (!QUEUE_EMPTY(&pq)) {
    q = QUEUE_HEAD(&pq);
    QUEUE_REMOVE(q);
    QUEUE_INIT(q);
    w = QUEUE_DATA(q, uv__io_t, pending_queue);
    w->cb(loop, w, POLLOUT);
  }

  return 1;
}
```

## uv__io_poll 函数
下面让我们来看看 I/O Polling 轮询，它是通过调用 `uv__io_poll` 函数来执行的。`uv__io_poll` 函数接收第二个 timeout 超时参数，这个参数由 `uv_backend_timeout` 函数计算提供，它决定了 `uv__io_poll` 阻塞 I/O 操作的时常。若是 timeout 为 0，将跳过 I/O polling 过程，事件循环机制将进入 check handlers 阶段（ 在这个阶段内 setImmediate 的回调函数也将会被执行 ）。那么这个 timeout 值到底是如何被确定的呢？通过上面 `uv_run` 的代码，我们可以推测一二：

1. 若是事件循环运行在 UV_RUN_DEFAULT 模式下，timeout 的值由 `uv_backend_timeout` 函数计算提供
2. 若是事件循环运行在 UV_RUN_ONCE 模式并且 uv_run_pending 函数返回 0 ( pending_queue 为空的情况 )，timeout 由 `uv_backend_timeout` 函数计算得出
3. 其余情况下，timeout 的值为 0

暂时您不需要去关心事件循环的不同模式（譬如：UV_RUN_DEFAULT 或是 UV_RUN_ONCE ），若是想了解，请看[以下链接](http://docs.libuv.org/en/v1.x/loop.html)

## uv_backend_timeout 函数
下面让我们来看看 uv_backend_timeout 函数的实现，以便更好地理解 timeout 是如何被确定的。

```
int uv_backend_timeout(const uv_loop_t* loop) {
  if (loop->stop_flag != 0)
    return 0;

  if (!uv__has_active_handles(loop) && !uv__has_active_reqs(loop))
    return 0;

  if (!QUEUE_EMPTY(&loop->idle_handles))
    return 0;

  if (!QUEUE_EMPTY(&loop->pending_queue))
    return 0;

  if (loop->closing_handles)
    return 0;

  return uv__next_timeout(loop);
}
```

1. 若是决定事件循环即将退出的 stop_flag 参数被设置，timeout 返回 0
2. 若是当前没有活动的句柄（handles）或挂起的任务，timeout 返回 0
3. 若是当前存在待执行的空闲操作，则系统不会等待 I/O 返回，此时 timeout 为 0
4. 若是当前 pending_queue 队列中有已完成的 I/O 操作，则系统不会等待 I/O 返回，此时 timeout 为 0
5. 若是当前存在任何待执行的 close 操作，则系统不会等待 I/O 返回，此时 timeout 为 0

若是，timeout 不为 0，则通过 `uv__next_timeout` 函数来决定 libuv 等待 I/O 完成的时间（即阻塞 I/O 的时间）

```
int uv__next_timeout(const uv_loop_t* loop) {
  const struct heap_node* heap_node;
  const uv_timer_t* handle;
  uint64_t diff;

  heap_node = heap_min((const struct heap*) &loop->timer_heap);
  if (heap_node == NULL)
    return -1; /* block indefinitely */

  handle = container_of(heap_node, uv_timer_t, heap_node);
  if (handle->timeout <= loop->time)
    return 0;

  diff = handle->timeout - loop->time;
  if (diff > INT_MAX)
    diff = INT_MAX;

  return diff;
}
```

`uv__next_timeout` 将会返回最近的定时器的值，若是当前没有定时器，则返回 -1 表示无穷大。现在您应该对为何 NodeJS 会在执行完 I/O 回调之后还要阻塞 I/O 的问题有了一定的了解。  

若是系统中，仍旧有待执行的任务，则不会阻塞事件循环。反之，若是没有，事件循环将被阻塞，直到最近的下一次定时器到期，它才会被重新激活。  

现在我们知道了事件循环应该阻塞（等待）多长时间 (timeout 时间) 才能完成 I/O 操作。这个 timeout 时间将会被传入 `uv__io_poll` 函数来监听 I/O 操作，直到定时器到期或系统最大超时时间到期为止。定时器到期后，将重新激活事件循环并转入 check handlers 事件阶段

## 关于 Threadpool 线程池的二三事
在这一系列文章中，我们不会详细讲述线程池。线程池通常用于文件 I/O 操作，需要注意的是，由于线程池的大小是有限的（默认是 4 个），当没有空闲的线程腾出的时候，多个文件 I/O 请求仍有可能会被阻塞。我们可以通过环境变量 `uvthreadpoolsize` 手动调节线程池的大小以提升应用的性能，最大能提升到 128 个线程。  

虽然可以手动增大线程池大小，但是固定大小的线程池仍会对 NodeJS 应用的性能造成瓶颈，更严重的是，file I/O, getaddrinfo 等操作并非是线程池唯一的操作，某些 CPU 密集型操作，譬如 Crypto 的 randomBytes, randomFill, pbkdf2 同样运行于 libuv 的线程池中，这样做，一方面避免了对上层 v8 引擎执行 js 的性能带来影响（运行在 libuv 的线程池中而非 v8 中），但是在另一方面，也加剧了本就不富裕的 libuv 线程池的压力。  

在之前的草案建议中，建议 libuv 根据负载，对线程池进行可伸缩操作，但是很可惜这个建议最终没被采纳，顺带本篇文章的部分内容源于 Saúl Ibarra Corretgé 在 2016 年的演讲，有兴趣的同学可以看[以下视频，需自备梯子](https://www.youtube.com/watch?v=sGTRmPiXD4Y)  

<video width="700px" src="//video.shenyujie.cc/2018-10-7-libuv.mp4" controls="controls"></video>

## 总结
在本篇文章中，我们深入 libuv 的源码本身，分析了 NodeJS 执行 I/O 操作的全过程。我相信非阻塞，事件驱动的 nodeJS 模型对网络编程更有意义。欢迎对本篇文章进行批评指正~