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