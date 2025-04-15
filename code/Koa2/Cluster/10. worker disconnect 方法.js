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