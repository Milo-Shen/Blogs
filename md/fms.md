---
title: 使用 FMS 实现 AJAX 数据模拟
date: 2017-07-15 19:24:00
tags: FMS
categories: FMS
comments: true

---

当后端 API 没有编写完成时，前端无法进行调试，这就导致了前端会被后端阻塞的情况。FMS 可以通过构建假数据，进而响应请求或生成页面。这样前后端只要协商一致接口文档（规范），便能同步开发[官网](http://www.fmsjs.org/beginning.html)  

<!--more-->

## 安装
FMS 基于 node 实现，故而安装 FMS 之前需要先安装 nodeJs

```
npm install fms
或者安装到全局
npm install fms -g
```

## 编写 fms.js

```
var fms = require('fms')
fms.run()
fms.ajax({
    url: '/test/',
    type: 'get',
    res: {
        ok: {
            data:{
                status:'ok',
                name:'hubery',
                sex:'male'
            }
        },
        err: 'no'
    }
})
```

## 编写测试 HTML (此处便用官方的例子)

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FMS Demo</title>
</head>
<body>
<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script>
$.ajax({
    url: '/test/',
    type: 'get'
}).done(function (data) {
    $('body').html(data)
})
</script>
</body>
</html>

```

## 启动 mockServer ( 启动 fms.js )
![](//img.shenyujie.cc/2017-8-18-1.png)

### 访问 3000 端口 : 
![此时我们可以看到生成的 AJAX 接口和接口文档](//img.shenyujie.cc/2017-8-18-4.png)

### 运行测试 html 
![此时可以看到，已经成功获取模拟接口 /test 的数据](//img.shenyujie.cc/2017-8-18-2.png)