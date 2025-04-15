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