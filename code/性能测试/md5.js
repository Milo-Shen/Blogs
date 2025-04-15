const MD5 = require('md5.js');
const http = require('http');

http.createServer(function (request, response) {

    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain
    response.writeHead(200, {'Content-Type': 'text/plain'});

    let md5 = null;

    for (let i = 0; i < 99; i++) {
        md5 = new MD5().update('hello world').digest('hex')
    }

    // 发送响应数据 "Hello World"
    response.end(md5);

}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');