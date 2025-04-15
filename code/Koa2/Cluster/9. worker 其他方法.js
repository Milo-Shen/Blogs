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