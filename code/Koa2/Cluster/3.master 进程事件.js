const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    for (let i = 0; i < numCPUs; i++) {
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