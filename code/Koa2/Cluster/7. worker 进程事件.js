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