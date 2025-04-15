---
title: nodejs 之 Cluster 模块 (一)
date: 2018-07-022 22:32:00
tags: nodejs
categories: nodejs
comments: true

---

前言：nodejs 作为一个单线程的执行引擎，无法发挥多核处理器应有的性能。好在 0.6.0 之后的 nodejs 内置了 cluster 集群模块帮助使得 nodejs 可以充分利用处理器的计算性能
<!--more-->

## Cluster 测试环境
操作系统 : mac os 10.13.5 & win10 1803 64bit & ubuntu 16.04 LTS
nodejs 版本 : v8.11.3

## 第一个 Cluster 应用例子

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('listening', function (worker, address) {
        console.log('listening: worker ' + worker.process.pid + ', Address: ' + address.address + ":" + address.port);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
    
} else {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world\n");
    }).listen(8000);
}
```

现在运行 nodejs，工作进程之间将会共享 8000 端口，运行结果：

```
master start...
listening: worker 847, Address: null:8000
listening: worker 844, Address: null:8000
listening: worker 846, Address: null:8000
listening: worker 845, Address: null:8000
```

该程序启动了 9 个 nodeJs 进程，其中一个 master 进程，8 个 worker 进程。此 8 个 worker 进程共同监听同一个端口 8000


## nodeJs Cluster 的调度机制

1. 循环法（ 非 windows 操作系统 ）：由主进程负责监听端口，接收新连接后再将连接循环分发给工作进程。在分发中使用了一些内置技巧防止工作进程任务过载。
2. 主进程创建监听socket后发送给感兴趣的工作进程，由工作进程负责直接接收连接，理论上这种方式最好，但实际应用时，经常会发生负载不均衡的情况发生

## Master 进程事件和方法

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
        // 用于创建一个新的工作进程
        cluster.fork();
    }

    // master 进程 fork 事件
    cluster.on('fork', worker => {
        console.log(`worker id: ${worker.id} is forked!`);
    });

    // master 进程 listening 事件
    // address 包含: address 、port、addressType 三个属性
    // addressType 包含： 4=>TCPv4, 6=>TCPv6, -1=>unix domain socket, udp4=>UDP v4, udp6=>UDP v6
    cluster.on('listening', (worker, address) => {
        console.log(`A worker: ${worker.id} is now connected to ${address.address}:${address.port}`);
    });

    // master 进程 online 事件
    // fork 事件是在主进程新建工作进程之后触发
    // online 事件是在工作进程运行的时候触发
    cluster.on('online', worker => {
        console.log(`worker : ${worker.id} is running`);
    });

    // master 进程 message 事件
    // message 为传递的参数
    cluster.on('message', (worker, message, handle) => {
        console.log(`[Master] [Message] : ${message}`)
        // nodejs v6.0 之前没有 worker 形参
    });

    // master 进程 disconnect 事件
    cluster.on('disconnect', worker => {
        console.log(`The worker #${worker.id} has disconnected`);
    });

    // master 进程 exit 事件
    // code <number> 正常退出情况下，是退出代码
    // signal <string> 导致进程被kill的信号名称 (例如 'SIGHUP')
    cluster.on('exit', (worker, code, signal) => {
        console.log('worker %d died (%s). restarting...',
            worker.process.pid, signal || code);
        // 可以用于重启进程
        cluster.fork();
    });

} else if (cluster.isWorker) {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(5555);
}
```

执行结果： 

```
master start...
worker id: 1 is forked!
worker id: 2 is forked!
worker id: 3 is forked!
worker id: 4 is forked!
worker : 1 is running
worker : 4 is running
worker : 3 is running
worker : 2 is running
A worker: 1 is now connected to null:5555
A worker: 4 is now connected to null:5555
A worker: 3 is now connected to null:5555
A worker: 2 is now connected to null:5555
```

在上述事件中，fork 事件先触发，然后再触发 online 事件，最后触发 listening 事件


## Worker 进程事件和方法

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('[master] ' + "start master...");

    for (let i = 0; i < numCPUs; i++) {
        let wk = cluster.fork();
        // send 方法用于主进程向子进程发送信息
        wk.send('[master] ' + 'hi worker' + wk.id);
    }

    cluster.on('fork', function (worker) {
        console.log('[master] ' + 'fork: worker' + worker.id);
    });

    cluster.on('online', function (worker) {
        console.log('[master] ' + 'online: worker' + worker.id);
    });

    cluster.on('listening', function (worker, address) {
        console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
    });

    cluster.on('disconnect', function (worker) {
        console.log('[master] ' + 'disconnect: worker' + worker.id);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('[master] ' + 'exit worker' + worker.id + ' died');
    });

    // master 进程 message 事件
    cluster.on('message', (worker, message, handle) => {
        console.log(`[master] [Message] : ${message}`)
    });

    function eachWorker(callback) {
        for (let id in cluster.workers) {
            callback(cluster.workers[id]);
        }
    }

    // 在主进程中每隔 3s 向子进程发送消息
    setTimeout(function () {
        eachWorker(function (worker) {
            worker.send('[master] ' + 'send message to worker' + worker.id);
        });
    }, 3000);

    // 在主进程中监听子进程发送过来的消息
    Object.keys(cluster.workers).forEach(function (id) {
        cluster.workers[id].on('message', function (msg) {
            console.log('[master] ' + 'message ' + msg);
        });
    });

} else if (cluster.isWorker) {
    console.log('[worker] ' + "start worker ..." + cluster.worker.id);

    // process.send 可以在子进程中向主进程发送消息
    process.on('message', function (msg) {
        console.log('[worker] ' + msg);
        process.send('[worker] worker' + cluster.worker.id + ' received!');
    });

    http.createServer(function (req, res) {
        res.writeHead(200, {"content-type": "text/html"});
        res.end('worker' + cluster.worker.id + ',PID:' + process.pid);
    }).listen(5555);

}
```

输出结果：

```
// 主进程启动
[master] start master...
// 主进程 fork 事件，用于启动工作进程
[master] fork: worker1
[master] fork: worker2
[master] fork: worker3
[master] fork: worker4
// 主进程 online 事件，用于监听子进程是否上线
[master] online: worker4
[master] online: worker3
[master] online: worker1
[master] online: worker2
// 子进程监听自身启动
[worker] start worker ...4
// 子进程（ 工作进程 )接收到主进程发来的信息
[worker] [master] hi worker4
[worker] start worker ...3
[worker] start worker ...1
// 主进程接收到子进程发来的信息 ( 主进程中 Cluster 的 message 事件接收 )
[master] [Message] : [worker] worker4 received!
// 主进程接收到子进程发来的信息 ( 主进程中 Worker 实例的 message 事件接收 )
[master] message [worker] worker4 received!
[worker] start worker ...2
[master] listening: worker4,pid:936, Address:null:5555
[worker] [master] hi worker3
[master] [Message] : [worker] worker3 received!
[master] message [worker] worker3 received!
[worker] [master] hi worker1
[master] [Message] : [worker] worker1 received!
[master] message [worker] worker1 received!
// 主进程 listening 事件
[master] listening: worker3,pid:935, Address:null:5555
[master] listening: worker1,pid:933, Address:null:5555
[worker] [master] hi worker2
[master] [Message] : [worker] worker2 received!
[master] message [worker] worker2 received!
[master] listening: worker2,pid:934, Address:null:5555
```

上述例子中：

1. cluster.isMaster 用于判断当前是否是主进程，cluster.isWorker 用于判断当前是否是子进程
2. 主进程中 Worker 进程实例对象的 send 方法用于在主进程中向子进程发送信息
3. 主进程 cluster 中的 message 方法可以监听所有 Worker 进程发送给主进程的消息
4. 子进程实例的 message 方法可以在主进程中监听该 Worker 进程发送给主进程的消息
5. 在子进程中，使用 process.send 可以给主进程发送消息

### fork 事件的应用

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    const timeouts = [];

    function errorMsg() {
        console.error('Something must be wrong with the connection ...');
    }

    cluster.on('fork', (worker) => {
        timeouts[worker.id] = setTimeout(errorMsg, 2000);
    });
    cluster.on('listening', (worker, address) => {
        clearTimeout(timeouts[worker.id]);
    });
    cluster.on('exit', (worker, code, signal) => {
        clearTimeout(timeouts[worker.id]);
        errorMsg();
    });

} else {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

由于 listening 和 exit 事件在 fork 事件触发之后才触发。所以我们可以用这个特性，来设置 Worker 进程的超时时间，若是一定时间内没能启动 Worker 进程，则抛出超时异常信息

## Cluster worker 对象 ( 在工作进程中代表当前工作进程 )

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

} else {
    // cluster.worker 只能在
    console.log(`current worker id: ${cluster.worker.id}`);
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

在工作进程中，cluster.worker 就代表当前 worker 工作进程本身，上面例子输出：

```
master start...
current worker id: 1
current worker id: 2
current worker id: 4
current worker id: 3
```

## Cluster workers 对象 ( 在主进程中代表所有工作进程集合 )

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // cluster.workers 只能在主进程中调用
    Object.keys(cluster.workers).forEach(id => {
        console.log(`cluster-workers-id: ${id}`);
    })

} else {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

Cluster workers 对象，在主进程中代表所有工作进程集合，上面输出结果为： 

```
master start...
cluster-workers-id: 1
cluster-workers-id: 2
cluster-workers-id: 3
cluster-workers-id: 4
```

## worker 进程事件

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    // 用于记录请求数量
    let count = 0;

    for (let i = 0; i < numCPUs; i++) {
        let worker = cluster.fork();

        // 工作进程 online 事件
        worker.on('online', () => {
            console.log(`worker id: ${worker.id} is online !`)
        });

        // 工作进程 disconnect 事件
        worker.on('disconnect', () => {
            console.log(`worker id: ${worker.id} is disconnected !`);
        });

        // 工作进程 exit 事件
        // code : <number> 若正常退出，表示退出代码
        // signal : <string> 引发进程被kill的信号名称（如'SIGHUP'）
        worker.on('exit', (code, signal) => {
            if (signal) {
                console.log(`worker was killed by signal: ${signal}`);
            } else if (code !== 0) {
                console.log(`worker exited with error code: ${code}`);
            } else console.log('worker exit success!');
        });

        // 工作进程 listening 事件
        worker.on('listening', address => {
            console.log(`当前工作进程启动：workerId: ${worker.id}, address port: ${address.port} !`);
        });

        // 工作进程 message 事件（可以用来实现主进程统计 cluster 请求数量）
        worker.on('message', (msg, handle) => {
            if (msg && msg.cmd && msg.cmd === 'notifyRequest') {
                count++;
                console.log(`当前请求量: ${count}`);
            }
        });
    }

} else if (cluster.isWorker) {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
        // 通知 master 进程接收到了请求
        process.send({cmd: 'notifyRequest'});
    }).listen(8000);
}
```

上述例子输出结果：

```
master start...
worker id: 1 is online !
worker id: 3 is online !
worker id: 2 is online !
当前工作进程启动：workerId: 1, address port: 8000 !
worker id: 4 is online !
当前工作进程启动：workerId: 3, address port: 8000 !
当前工作进程启动：workerId: 2, address port: 8000 !
当前工作进程启动：workerId: 4, address port: 8000 !
```

## Worker 进程 send 方法

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

// worker.send 方法
// 发送一个消息给工作进程或主进程
// 主进程调用这个方法会发送消息给具体的工作进程 (等价方法：ChildProcess.send)
// 工作进程调用这个方法会发送消息给主进程 （等价方法：process.send）

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < 4; i++) {
        let worker = cluster.fork();

        // 工作进程 send 方法
        // message <Object> 需要发送的信息
        // sendHandle 可以发送句柄
        worker.send('hello world');
    }

    cluster.on('message', (worker, message, handle) => {
        console.log(`主进程接收到子进程消息：${message}`);
    });

} else if (cluster.isWorker) {
    process.on('message', msg => {
        console.log(`子进程接收到主进程消息：${msg}`);
        // 子进程发送消息给主进程
        process.send('received !');
    });
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

## Worker 进程的其他方法

```
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

// worker.send 方法
// 发送一个消息给工作进程或主进程
// 主进程调用这个方法会发送消息给具体的工作进程 (等价方法：ChildProcess.send)
// 工作进程调用这个方法会发送消息给主进程 （等价方法：process.send）

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
        let worker = cluster.fork();
    }

} else if (cluster.isWorker) {
    // cluster.worker 是当前工作进程的引用
    // cluster.worker 对主进程无效
    let worker = cluster.worker;
    // 输出当前工作进程的 id
    console.log(worker.id);
    // worker.isConnected 方法
    // 当工作进程通过 ipc 管道连接到主进程时，返回 true
    console.log(worker.isConnected());
    // worker.idDead 方法
    // 当工作进程被终止时（自动退出或是发送信号），返回 true
    console.log(worker.isDead());
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

上面代码的执行结果：

```
master start...
4
true
false
1
true
false
2
true
false
3
true
false
```

## Worker 实例的 disconnect 事件

```
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {
    console.log(cluster.settings);

    console.log("master start...");

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker id: ${worker.id}, ${worker.exitedAfterDisconnect}`)
    });

    let worker1 = cluster.fork();
    let worker2 = cluster.fork();

    worker2.on('listening', () => {
        console.log('worker2 is listening');
    });

    worker2.on('disconnect', () => {
        console.log('worker2 is disconnected !');
    });

    worker2.on('exit', () => {
        console.log('worker2 is exited !');
        worker1.kill();
    });

    worker1.on('disconnect', () => {
        console.log('worker1 is disconnected !');
    });

    worker1.on('exit', () => {
        console.log('worker1 is exited !');
    });

} else if (cluster.isWorker) {
    http.createServer(function (req, res) {
        console.log(`request enter, workerId: ${cluster.worker.id}`);
        res.writeHead(200);
        res.end("hello world");
        if (cluster.worker.id === 2) {
            throw new Error('test exitedAfterDisconnect');
        }
    }).listen(8000);
}
```

说明：我们启动了 2 个 Wroker 进程，测试时我们访问 localhost:8080，当 worker.id 为 2 的工作进程接收到请求时，手动抛出异常，触发该工作进程的 disconnect 方法。上述代码执行结果：

```
master start...
worker2 is listening
request enter, workerId: 1
request enter, workerId: 1
request enter, workerId: 2
/Cluster/10. worker disconnect 方法.js:43
            throw new Error('test exitedAfterDisconnect');
            ^

Error: test exitedAfterDisconnect
    at Server.<anonymous> (/Users/shenyujie/svn/myBlogs/code/Koa2/Cluster/10. worker disconnect 方法.js:43:19)
    at emitTwo (events.js:126:13)
    at Server.emit (events.js:214:7)
    at parserOnIncoming (_http_server.js:619:12)
    at HTTPParser.parserOnHeadersComplete (_http_common.js:112:17)
worker2 is disconnected !
worker2 is exited !
worker id: 2, false
request enter, workerId: 1
```

上述代码中，当工作进程 2 接收到用户请求并抛出异常后，我们发现 worker2 先是触发了 disconnected 事件端来数据连接，然后触发 exit 事件，退出了该工作进程

## Worker 实例的 disconnect 方法

```
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {
    console.log("master start...");

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker id: ${worker.id}, ${worker.exitedAfterDisconnect}`)
    });

    let worker1 = cluster.fork();
    let worker2 = cluster.fork();
    worker1.on('listening', () => {
        console.log(`worker id: ${worker1.id}`);
        setTimeout(() => {
            // 5s 后断开该工作进程
            worker1.disconnect();
        }, 5000)
    });

    worker1.on('disconnect', () => {
        console.log('worker1 is disconnected !');
    });

    worker1.on('exit', () => {
        console.log('worker1 is exited !');
    });

} else if (cluster.isWorker) {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

上述代码中，我们在工作进程 1 启动 5s 后手动执行其 disconnect 方法，执行结果如下：

```
master start...
worker id: 1
worker1 is disconnected !
worker1 is exited !
worker id: 1, true
```

我们发现，手动执行 disconnected 方法后，该工作进程同样会先触发 disconnect 事件关闭数据连接，而后触发 exit 事件退出当前工作进程

## Worker 实例的 kill 方法

```
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {
    console.log("master start...");

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker id: ${worker.id}, ${worker.exitedAfterDisconnect}`)
    });

    let worker1 = cluster.fork();
    let worker2 = cluster.fork();
    worker1.on('listening', () => {
        console.log(`worker id: ${worker1.id}`);
        setTimeout(() => {
            // 5s 后断开该工作进程
            // worker.destroy() 与 worker.kill() 等义
            worker1.kill();
        }, 5000)
    });

    worker1.on('disconnect', () => {
        console.log('worker1 is disconnected !');
    });

    worker1.on('exit', () => {
        console.log('worker1 is exited !');
    });

} else if (cluster.isWorker) {
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```

代码执行结果：

```
master start...
worker id: 1
worker1 is disconnected !
worker1 is exited !
worker id: 1, true
```

从执行结果来看，kill 方法和 disconnect 方法效果相同，区别是 disconnect 存在无法退出的情况，此时可以调用 kill 方法手动杀掉该进程

## master 和 worker 中的 process 并不相同

```
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {
    console.log("master start...");

    var _process = process;


    for (let i = 0; i < 1; i++) {
        cluster.fork();
    }

} else if (cluster.isWorker) {
    // 输出 false
    console.log(process === _process);
    // 输出 true
    console.log(process === cluster.worker.process);
    console.log('--------------');
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}
```