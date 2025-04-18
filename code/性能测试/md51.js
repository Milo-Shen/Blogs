const MD5 = require('md5.js');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer((req, res) => {

        res.writeHead(200);

        let md5 = null;

        for (let i = 0; i < 99; i++) {
            md5 = new MD5().update('hello world').digest('hex')
        }

        res.end(md5);

    }).listen(8000);

    console.log(`Worker ${process.pid} started`);
}