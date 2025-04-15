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