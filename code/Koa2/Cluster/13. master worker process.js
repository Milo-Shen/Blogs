const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("master start...");

    var _process = process;


    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

} else if (cluster.isWorker) {
    console.log(process === _process);
    console.log(process === cluster.worker.process);
    http.createServer(function (req, res) {
        res.writeHead(200);
        res.end("hello world");
    }).listen(8000);
}