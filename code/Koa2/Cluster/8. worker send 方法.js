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