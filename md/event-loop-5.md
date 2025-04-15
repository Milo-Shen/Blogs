---
title: NodeJS 事件循环 (第五章) 翻译稿
date: 2018-10-07 21:45:00
tags: [nodejs,翻译]
categories: [nodejs,翻译]
comments: true

---

![原文地址: https://jsblog.insiderattack.net/event-loop-best-practices-nodejs-event-loop-part-5-e29b2b50bfe2](https://img.shenyujie.cc/2018-10-7-event-loop-5-cover.jpg)

欢迎回到事件循环系列文章，在上面几章的讲述中，我们讨论了事件循环的不同阶段。在这一章中，我们将一起探讨一些最佳实践，来帮助我们编写性能更优的 NodeJS 应用程序。

<!--more-->

## 往期文章导航
+ [事件循环总览](//www.shenyujie.cc/2018/10/07/event-loop-1/)
+ [Timers, Immediates and Next Ticks](//www.shenyujie.cc/2018/10/07/event-loop-2/)
+ [Promises, Next-Ticks and Immediates](//www.shenyujie.cc/2018/10/07/event-loop-3/)
+ [Handling I/O](//www.shenyujie.cc/2018/10/07/event-loop-4/)
+ 事件循环的最佳实践(本篇文章)

## 避免在频繁调用的代码块中出现同步 I/O 操作
尽量避免同步的 I/O 操作，由于会阻塞事件循环，同步的操作会很大程度上降低 NodeJS 应用的性能。若是一定要用，建议用于 NodeJS 启动时读取配置文件。

## 编写函数时，必须完全同步或完全异步
为 NodeJS 编写的函数分为以下两种：

1. Synchronous Functions —— 同步函数，它们通常使用 return 来返回执行结果
2. Asynchronous Functions —— 异步函数，它们通常使用回调或 promise 来返回执行结果

这里给出的建议是，编写函数时，要么完全严格都是同步函数，要么都是异步函数，不要两者混在一起使用，这么做有可能会造成一些不可预知的结果。

### 同步-异步混合写法造成的问题举例

```
const cache = {};

function readFile(fileName, callback) {
    if (cache[filename]) {
        return callback(null, cache[filename])
    }
    
    fs.readFile(fileName, (err, fileContent) => {
        if (err) return callback(err);
        cache[fileName] = fileContent;
        callback(null, fileContent);
    });
}
```

让我们使用上面的程序实际执行下，为了叙述简便，这里省略了错误处理：

```
function letsRead(){
  readFile('myfile.txt', (err, result) => {
    // 此处省略错误处理
    console.log('file read complete');
  });

  console.log('file read initiated')
}
```

我们把上述代码执行 2 次，输出结果为：

```
// 第一次执行
file read initiated
file read complete

// 第二次执行
file read complete
file read initiated 
```

那么为什么两次输出的结果相反呢？这是因为第一次执行该程序的时候文件 myfile.txt 并未被缓存下来，此时我们需要通过异步函数 `fs.readFile` 来访问文件 myfile.txt，此时我们编写的函数 `readFile` 表现为异步函数，故而输出 file read initiated 在前。  

当我们第二次执行 `readFile` 函数时，由于文件 myfile.txt 已经被缓存下来了，不需要借助异步函数 `fs.readFile`了，故而此时我们编写的 `readFile` 函数表现为了同步函数，故而先输出了：file read complete  

所以，当我们的 NodeJS 应用变得越来越复杂时，类似上述这种，同步-异步混合的写法就会给我们的开发调试工作带来极大的风险和不便，所以我们必须时刻遵守要么全部写成同步，要么全部写成异步的原则。千万不要随随便便混合使用。  

### 化解同步-异步混合写法造成的问题
那么上述的同步-异步混合写法造成的问题如何解决呢，下面给出 2 点建议：

1. 把异步函数 `fs.readFile` 替换成同步版本 `fs.readFileSync`
2. 把自己编写的 `readFile` 变成一个完全的异步函数

由于在 NodeJS 编程中不推荐使用同步函数，故而下面我们来尝试第二种方法，我们使用 `process.nextTick` 来改写上述代码，如下：

```
const cache = {};

function readFile(fileName, callback) {
    if (cache[filename]) {
        return process.nextTick(() => callback(null, cache[filename]));
    }

    fs.readFile(fileName, (err, fileContent) => {
        if (err) return callback(err);
        
        cache[fileName] = fileContent;
        callback(null, fileContent);
    });
}
```

process.nextTick 会将回调函数的执行推迟到事件循环的下一个阶段，现在我们执行 letsRead 函数 2 次，我们将会得到同样的结果。

```
// 第一次执行
file read initiated
file read complete

// 第二次执行
file read initiated
file read complete
```

当然我们也可以使用 `setImmediate` 来实现，但是我更倾向于 `process.nextTick` ，因为它的执行时机比 `setImmediate` 更早。

## 避免频繁或递归地使用 process.nextTick
递归或是频繁地使用 `process.nextTick` 函数会造成 I/O starvation （I/O 饿死）问题，故而我们要避免频繁使用。

## dns.lookup() vs dns.resolve*()
若是您已经浏览了 DNS 模块的 NodeJS 文档，您可能已经看到了有 2 种方式将 host name 解析为 IP 地址，`dns.lookup` 或是 dns resolve 系列方法(`dns.resolve4`， `dns.resolve6`)。虽然这两种方法的功能看似相同，但是内部实现则迥然不同。  

`dns.lookup` 解析 IP 地址的方式和 `ping` 命令解析 IP 的原理相似。它调用的是系统 network API 的 `getaddrinfo`，为了包装成异步的效果，该方法通过 `uv_getaddrinfo` 函数运行在 libuv 的线程池 threadpool 上，这可能造成与 threadpool 线程池上运行的其他任务之间产生线程争抢，可能对应用程序的性能造成影响 ( 何况线程池默认只有可怜的区区 4 个线程 ) 。现实的场景是，4 个并发的 `dns.lookup` 调用就可以消耗掉整个线程池，从而造成线程池中的其他任务得不到执行（譬如：file I/O，crypto ）  

而 `dns.resolve()` 系列方法的工作原理就和 `dns.lookup` 截然不同了，下面是 `dns.resolve*` 官方文档的描述：

> 这些函数的实现方式与 `dns.lookup` 截然不同，它们不使用 `getaddrinfo`，而是直接在网络上执行异步的 DNS 查询且不使用 libuv 的线程池 threadpool

NodeJS 使用 c-ares 来提供直接运行在网络上的，不依赖于 libuv 的线程池的 DNS resolve 功能  

所以我们使用 `dns.resolve()` 系列方法来代替 `dns.lookup`方法是可取的，它不会增加线程池负载。除非有特殊要求不得不使用到 `dns.lookup`，譬如配置 `/etc/nsswitch.conf` 或是 `etc/hosts` 等。  

然而下面我们遇到了一个更大的[问题](https://github.com/request/request/issues/2491)。  

当我们使用 NodeJS 进行一个 http 请求时，它首先会将 url 解析成 ip 地址，然后使用解析出来的 ip 地址异步地建立一个 TCP 连接。故而建立一个 http 请求需要经过 2 个步骤。  

现状是，NodeJS 的 http 和 https 模块内部都使用 `dns.lookup` 来解析 ip 地址。若是此时 DNS 服务器失效或是 DNS 延迟过高，就有可能造成先前进来的多个 http 请求消耗完了线程池的资源，而使得线程池对后续的请求停止响应。更早的是，很多第三方模块，譬如 `request` 也是用了 `http` 或是 `https` 模块作为基础，同样也会受到这个问题的影响。  

若是您在 File I/O，crypto 或是其他依赖于 libuv 的 threadpool 线程池的任务方面发现有显著的性能下降，您可以做以下事情来提升性能：

1. 可以通过设置环境变量 `UV_THREADPOOL_SIZE` 来提升线程池大小至最高的 128 个
2. 使用 `dns.resolve* ` 系列方法来解析 ip 地址，并直接使用 ip 地址

以下代码是一个结合 request 和 `dns.resolve* ` 的示例，没有经过优化，只是一个指南。若是想让其变得更加健壮，还需要考虑很多其他方面的事情。此外，以下代码可以运行在 Node v8.0.0 中。

```
const dns = require('dns');
const http = require('http');
const https = require('https');
const tls = require('tls');
const net = require('net');
const request = require('request');

const httpAgent = new http.Agent();
const httpsAgent = new https.Agent();

const createConnection = ({ isHttps = false } = {}) => {
    const connect = isHttps ? tls.connect : net.connect;
    return function(args, cb) {
        return connect({
            port : args.port,
            host : args.host,
            lookup : function(hostname, args, cb) {
                dns.resolve(hostname, function(err, ips) {
                    if (err) { return cb(err); }

                    return cb(null, ips[0], 4);
                });
            }
        }, cb);
    }
};

httpAgent.createConnection = createConnection();
httpsAgent.createConnection = createConnection({isHttps: true});

function getRequest(reqUrl) {
    request({
        method: 'get',
        url: reqUrl,
        agent: httpsAgent
    }, (err, res) => {
        if (err) throw err;
        console.log(res.body);
    })
}

getRequest('https://example.com');
```

## 更多关注线程池的使用
由于除了 File I/O 以外，libuv 的线程池中还处理着大量其他的任务，并且有可能造成性能瓶颈。故而在有必要的时候，我们可以通过设置环境变量 `UV_THREADPOOL_SIZE ` 开扩大线程池的容量

## Event loop monitoring 监测时间循环
监控事件循环的延迟对于防止循环中断是至关重要的。监控延迟同时也可以生成预警，控制重启，并进行一些扩展任务。  

识别事件循环延迟最简单的方法是检查定时器执行回调函数额外花费的时间。假设我们设定了一个 500ms 的定时器，若是实际上花了 550ms 才执行完回调函数，那么我们可以粗略认为事件循环的延迟大约是 50ms。这个额外的 50ms 可以被认为是执行事件循环的其他阶段所花费的时间。下面我们可以使用[loopbench](https://www.npmjs.com/package/loopbench)工具进行事件循环监测，代码如下：

```
const LoopBench = require('loopbench');
const loopBench = LoopBench();

console.log(`loop delay: ${loopBench.delay}`);
console.log(`loop delay limit: ${loopBench.limit}`);
console.log(`is loop overloaded: ${loopBench.overLimit}`);
```

输出如下：

```
"loop_delay": "1.2913 ms",
"loop_delay_limit": "42 ms",
"is_loop_overloaded": false
```

我们可以在性能监测工具中集成该功能，以便帮助我们更好地发现问题。最后感谢大家观看这一系列的文章，有任何不足之处，欢迎大家批评指正~