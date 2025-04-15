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