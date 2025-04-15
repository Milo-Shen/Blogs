---
title: Javascript 跨域(四)之 window.name + iframe
date: 2016-08-10 20:53:37
tags: 跨域
categories: javascript
comments: true
---
我们知道，iframe 是 html 的一个标签，可以在页面中创建内联框架，它有个src 属性（可以指向文件地址，html，php等）可以选择内联框架的内容。window.name 是当前窗口的名字，每个 iframe 都有包裹它的window，而这个 window 是 top window 的子窗口，既然同为 window 对象，则其自然也有 window.name 的值<!--more-->  

window.name 的神奇之处在于 name 的值在不同的页面甚至是不同的域名加载后依然存在，而且可以最大支持  2mb 的值  

如此我们可以试想一下，假设我们在 A.html 页面下请求远程服务器的数据，我们可以在该页面下新建一个 iframe 标签，该 iframe 标签的 src 属性指向远程服务器的地址（与 script 和 img 标签类似，其 src 的访问不受跨域的限制），与此同时服务器端设置好 window.name 的值（该 iframe 的 contentWindow 的 name 值），然后在 A.html 里面读取该 iframe 的 window.name 的值，似乎我们的目的就能实现了  

我们先编写服务器端，与先前一样，仍旧使用 nodejs ，代码如下：

```
var app = require('express')();
var http = require('http').Server(app);

app.get('/getData', function (req, res) {
    var content =
        '<h1>Welcome to window.name page</h1>' +
        '<script type="text/javascript">window.name = "hello window.name"</script>';
    res.send(content);
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
```

接下去编写客户端代码 (A.html)：  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>getData</title>
</head>
<body>
<script type="text/javascript">
    var iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3000/getData';
    document.body.appendChild(iframe);
    iframe.onload = function () {
        console.log(iframe.contentWindow.name);
    };
</script>
</body>
</html>
```

服务端运行结果如下：  
![](//img.shenyujie.cc/2016-8-10-window_name-server-show.PNG)
此时：服务端 window.name 的值设置成功  

客户端结果运行如下：　　
![](//img.shenyujie.cc/2016-8-10-window_name-client-2-show.PNG)
但不幸的是报错了，究其原因是因为 A.html 页面和其内含的 iframe 标签的 src 若是不同源（此处端口号分别为3000 和 63342），那么我们还是没法操作 iframe 框架内的任何东西，所以这里我们就不能取到 iframe 的 name 值了，但是真的就此束手无策了吗，那不是的，另辟蹊径，加之前面说了，无论怎样加载，window.name 的值都不会发生变化，于是我们在 A.html 相同的目录下，新建一个 proxy.html 的空页面，此时我们修改客户端的代码如下： 

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>getData</title>
</head>
<body>
<script type="text/javascript">
    var iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3000/getData';
    document.body.appendChild(iframe);
    iframe.onload = function () {
        iframe.src = 'http://localhost:63342/cros/proxy/proxy.html';
        console.log(iframe.contentWindow.name);
    };
</script>
</body>
</html>
```

我们可以在 iframe 加载完成的瞬间，改变该 iframe 的src 指向，使之与 A.html 同源，如此 A.html 页面便可以成功获取到 window.name 的值了。但此处还有一个问题，就是每次 onload 时事件触发时，我们重置了 iframe 的 src 指向，相当于重新加载了页面，如此又会触发 onload 事件，如此会造成页面不断地刷新，所以就有了我们下面的改进方式：  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>getData</title>
</head>
<body>
<script type="text/javascript">
    var iframe = document.createElement('iframe');
    // 默认隐藏此 iframe 标签
    iframe.style.display = 'none';
    // 设置一个状态值，保证只触发一次 onload 事件
    var state = 0;
    document.body.appendChild(iframe);
    iframe.onload = function () {
        // 若是首次触发 iframe 的 onload 事件
        if (state === 1) {
            console.log('成功获取到跨域的值为：' + iframe.contentWindow.name);
            iframe.contentWindow.document.writeln('信息发送成功');
            iframe.contentWindow.close();
            document.body.removeChild(iframe);
        } else if (state === 0) {
            state = 1;
            iframe.contentWindow.location = 'http://localhost:63342/cros/proxy/proxy.html';
        }
    };
    iframe.src = 'http://localhost:3000/getData';
    document.body.appendChild(iframe);
</script>
</body>
</html>
```

执行结果如下所示：  
![](//img.shenyujie.cc/2016-8-10-window_name-client-success.PNG)
此时我们得到了异步调用的值：hello window.name，跨域成功  

## 封装后的方法  
对于那些对原理不是很感冒的童鞋，我们这里封装一个方法，以供调用：  

```
<script type="text/javascript">
    /**
     * 功能 ： 用于进行跨域请求
     * @param proxy_url   代理 html 的地址
     * @param target_url  发送请求的地址
     * @param fn
     */
    function crossDomain(proxy_url, target_url, fn) {
        iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        var state = 0;
        iframe.onload = function () {
            if (state === 1) {
                fn(iframe.contentWindow.name);
                iframe.contentWindow.document.write('');
                iframe.contentWindow.close();
                document.body.removeChild(iframe);
            } else if (state === 0) {
                state = 1;
                iframe.contentWindow.location = proxy_url;
            }
        };
        iframe.src = target_url;
        document.body.appendChild(iframe);
    }
</script>
```

用法如下：  

* 接发送请求的地址是：`http://localhost:3000/getData`  
* 代理文件的地址是：`http://localhost:63342/cros/proxy/proxy.html`  

```
var target_url = 'http://localhost:3000/getData';
var proxy_url = 'http://localhost:63342/cros/proxy/proxy.html';
crossDomain(proxy_url, target_url, function (data) {
    console.log(data);
});
```

PS : proxy 文件可以不存在，虽然会报 404 错误，但是不影响功能  


