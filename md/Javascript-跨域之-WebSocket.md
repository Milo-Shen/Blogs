---
title: Javascript 跨域(三)之 WebSocket
date: 2016-08-01 21:40:03
tags: 跨域
categories: javascript
comments: true
---
websocket 被称为 Web 领域的实时推送技术，也被称作为 Realtime 技术，有别于 ajax 轮询，它能实现真正意义上的实时消息推送，它有着广泛的应用场景，比如在线聊天室，web 客服或是 WebIM 等等。除此之外，我们还可用它来实现前端的跨域数据访问
<!--more-->  

## 以下使用 nodejs 实现一个简易的 WebSocket 服务器  
> nodeJs version : v 6.5.0
> system environment : windows 10 1607  

## WebSocket 简介  
为了实现推送技术，通常采用的方式是轮询（Polling） 和 Comet 技术， Comet 技术又可细分为两种，一种是长轮询机制，还有一种被称为流技术，但是这两种方式归根结底还是对轮询的改进，仍旧无法避免需要浏览器周期性地向服务器发送 HTTP 请求。面对这种情况，HTML5 定义了 WebSocket，用于更好地实现真正意义上的实时推送。  

为了建立一个WebSocket连接，客户端浏览器首先要向服务器发起一个HTTP请求，这个请求和通常的HTTP请求不同，包含了一些附加头信息，其中附加头信息”Upgrade: WebSocket”表明这是一个申请协议升级的HTTP请求，服务器端解析这些附加的头信息然后产生应答信息返回给客户端，客户端和服务器端的WebSocket连接就建立起来了，双方就可以通过这个连接通道自由的传递信息，并且这个连接会持续存在直到客户端或者服务器端的某一方主动的关闭连接。  

下面是一个 WebSocket 客户端请求头的例子：

![](//img.shenyujie.cc/2016-8-1-websocket-ws.PNG)

## nodeJs 与 Socket.io

这里使用 nodeJs 制作一个简单的 WebSocket 服务器，为了方便起见，我们使用 Socket.io 库，它是一个基于 nodeJs 的开源的 WebSocket 库，他不仅通过 nodeJs 实现了服务端的 WebSocket 服务，同时也为我们提供了客户端的 JS 库。  

Socket.IO支持4种协议：WebSocket、htmlfile、xhr-polling、jsonp-polling，它会自动根据浏览器选择适合的通讯方式，从而让开发者可以聚焦到功能的实现而不是平台的兼容性，同时Socket.IO具有不错的稳定性和性能。

## 安装 nodeJs  
可以去官网 [nodeJs 英文官网](https://nodejs.org/en/) 下载对应的版本，若是需要下载最新版本的　nodeJs，这里推荐去英文官网，中文官网的版本更新速度相对较慢  

## 搭建 WebSocket 服务器  
这边不考虑生产环境（如需要可以把 WebSocket 服务搭建成一个线上可以用域名访问的服务），我们可以直接使用 localhost、本地 IP 或者使用一个虚拟域名指向本地 IP

我们先进入工作目录， 比如：D:\WebSocket, 新建一个 `package.json` 的文件，内容如下：  

```
{
  "name": "websocket-server",
  "version": "0.0.1",
  "description": "my websocket server",
  "dependencies": {
    "express": "^4.14.0",
    "socket.io": "^1.4.8"
  }
}

```

接下来我们在 CMD 窗口中进入工作文件夹 `cd D:\WebSocket` ,然后使用 npm 命令安装 `express` 和 `socket.io`  

```
npm install --save express
npm install --save socket.io
```

安装成功后，我们在工作目录会看到一个名为 node_modules 的文件夹，里面包含了 `express` 和 `socket.io` ，接下来我们编写服务端代码，首先新建一个 JS 文件：websocket.js  

```
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.send('<h1>Welcome to WebSocket Server</h1>');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

io.on('connection', function (socket) {
    console.log('进入');
    setInterval(function () {
        io.emit('message', 'webSocket');
    }, 1000);
});
```

这边我们监听 3000 端口，当有客户端连接时，便每隔 1S 向客户端发送一个字符串  
首先我们用命令行运行 node websocket.js，若是顺利我们可以在控制台中看到返回的 `listening on *:3000` 信息，说明服务已经搭建成功。此时浏览器里输入 `http://localhost:3000`，可以看到正常的欢迎页面:  
![](//img.shenyujie.cc/2016-8-1-websocket-run.PNG)
至此，服务端编写完成

## 客户端代码实现  
PS :　我们可以使用 socket.io 提供的客户端 JS 库，地址为 ： http://localhost:3000/socket.io/socket.io.js  
完整代码如下：  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
</head>
<body>
<script type="text/javascript">
    var socket = io.connect('ws://localhost:3000/');
    socket.send('hello Websocket');
    socket.on('message', function (obj) {
        console.log(obj);
    })
</script>
</body>
</html>
```

随后我们访问此页面，为了验证是否进行了跨域，我们使这个页面运行在与 websocket 服务端不同的端口号下，此时即为跨域，见下图
![](//img.shenyujie.cc/2016-8-1-websocket-poll_two.PNG)

此时可以看到，页面挂载在端口 63342 下，与 WebSocket 服务所在的 3000 端口并不同，但是此时 websocket 连接成功创建并且返回了数据，此处可见，使用 websocket 来进行跨域是可行的。  

![](//img.shenyujie.cc/2016-8-1-websocket-poll_one.PNG)

其次我们可以看到的是，WebSocket 与客户端建立连接后，并未向 ajax 请求那样返回数据后就立即结束，而是一直处于 padding 状态，这极大地减小了发送 HTTP request 的数量，实现了真正意义上的实时推送  

PS ： 下面表格列出了跨域的详细情况:  

| URL           | 说明           | 是否允许通讯  |
|:----------------------------------------------|:--------|:----|
|http://www.a.com/a.js<br/>http://www.a.com/b.js| 同一域名下 | 允许 |
|http://www.a.com/lab/a.js<br/>http://www.a.com/script/b.js| 同一域名下不同文件夹 | 允许 |
| http://www.a.com:8000/a.js<br/>http://www.a.com/b.js | 同一域名，不同端口 | 不允许 |
| http://www.a.com/a.js<br/>https://www.a.com/b.js | 一域名，不同协议 | 不允许 |
| http://www.a.com/a.js<br/>http://192.168.199.1/b.js | 域名和域名对应ip | 不允许 |
| http://www.a.com/a.js<br/>http://script.a.com/b.js | 主域相同，子域不同 | 不允许 |
| http://www.a.com/a.js<br/>http://a.com/b.js | 同一域名，不同二级域名（同上） | 不允许（cookie这种情况下也不允许访问） |
| http://www.cnblogs.com/a.js<br/>http://www.a.com/b.js | 不同域名 | 不允许 |
 
