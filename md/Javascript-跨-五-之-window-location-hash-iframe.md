---
title: Javascript 跨域(五)之 window.location.hash + iframe
date: 2016-08-15 10:33:19
tags: 跨域
categories: javascript
comments: true
---
上一次我们介绍了如何使用 window.name + iframe 来跨域，其中我们碰到了同源政策所带来的阻碍，但借助于重定向 src ，我们最终还是成功获取到了跨域的数据，此文的原理和上一篇大致相同，同样需要插入子窗口，同样需要我们对同源政策进行处理。  
<!--more-->
## 何为 local.hash (锚部分)
工欲善其事，必先利其器，要了解 location.hash + iframe 的跨域原理，我们首先要知道何为 window.hash，其实他就是浏览器 url `#` 符号后面的部分，我们称之为锚部分，详情可见 w3c 对此的 [定义](http://www.runoob.com/jsref/prop-loc-hash.html)。那么何为锚点呢？ 我们可以看一下例子  

### 何为锚点
锚点可以让文档滚动到指定的位置，这个位置可以由我们自己来指定，博客园，百度百科里的导航就是使用的这种技术，简单的 demo 如下：  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>锚点</title>
    <style type="text/css" rel="stylesheet">
        div {
            width: 400px;
            height: 200px;
        }
    </style>
</head>
<body>
<a href='#1'>red</a>
<a href='#2'>black</a>
<a href='#3'>yellow</a>
<a href='#4'>pink</a>
<div id='1' style="background-color: red"></div>
<div id='2' style="background-color: black"></div>
<div id='3' style="background-color: yellow"></div>
<div id='4' style="background-color: pink"></div>
</body>
</html>
```

效果如下:  
![](//img.shenyujie.cc/2016-8-15-hash-yellow.png)

点击 yellow 的时候，页面便会自动滚动到 yellow 的位置，此时锚点的作用就显现出来了。同样的，点击的时候浏览器的地址栏发生了改变，多出来的正是 location.hash 的值  

![](//img.shenyujie.cc/2016-8-15-hash-console.png)

location.hash 的用法和 location.href 类似，不仅可以获取它的值，还能对它进行重定向。此处我们设置 `window.location.hash = '#2'` ，然后页面会跳转到黑色块的区域，和我们直接点击 `<a href='#2'>black</a>` 标签的锚点效果是一致的。  

## 正式开始进行跨域：  
### 跨域的原理简介 ：  
原理和 window.name 差不多，只不过数据的载体不同。window.name 是把数据写在 window.name 这个属性上，而 location.hash 则是将数据当做改变后的路径的 hash 值加在 URL 后面，然后我们就能愉快得通信了。特别注明的是，在 HTML 5中有 hashchange 事件可以监听 location.hash 值的改变，此处我们需要额外使用 setInterval 轮询来降级兼容 IE 浏览器。当 hash 值改变时，我们便能拿到跨域的数据了  

现假设属于 localhost:63342 端口下的 A.html 文件，与属于 localhost:5555 端口下的 B.html 需要交换数据。以下是操作步骤：  

+ A.html 首先自动创建一个隐藏的 iframe，然后把这个 iframe 的 src 地址指向 localhost:63342 下面的 B.html  

+ B.html 响应请求后修改 A.html 的 hash 值来传递数据  

+ 在 A.html 页面上面绑定一个定时器，每隔一段时间来判断 location.hash 值是否发生变化，一但发生变化则立即获取该 hash 值  

localhost:63342 下的 A.html :  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>location.hash 跨域</title>
</head>
<body>
<script type="text/javascript">
    function crossDomain() {
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        // 此处指向需要跨域的地址
        iframe.src = 'http://localhost:5555/B.html';
        document.body.appendChild(iframe);
    }

    crossDomain();

    if ('onhashchange' in window.document.body) {
        window.onhashchange = function () {
            var data = location.hash ? location.hash.substring(1) : '';
            console.log('Now the crossDomain data is ' + data);
        }
    } else {
        var command = setInterval(function () {
            try {
                // 用于检测 URL 后面的 hash 值是否发生改变,若是发生改变则获取
                var data = location.hash ? location.hash.substring(1) : '';
                console.log('Now the crossDomain data is ' + data);
                clearInterval(command);
            } catch (e) {
                console.error(e);
            }

        }, 2000);
    }

</script>
</body>
</html>
```

localhost:5555 下的 B.html :  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>B.html</title>
</head>
<body>
<script type="text/javascript">

    // 需要被传输的数据
    var crossDomainData = 'crossDomainByHash';
    // 判断传输的数据是否是字符串
    crossDomainData = '#' + ((typeof crossDomainData === 'string') ? crossDomainData : JSON.stringify(crossDomainData));
    // 做兼容性处理
    try {
        // 尝试改变父窗口中的 hash 的值
        window.parent.location.hash = crossDomainData;
    } catch (e) {
        // IE 和 chrome 由于同源政策的限制,无法直接修改 parent.location.hash
        // 此处我们使用一个 localhost:3000 域下的代理 iframe
        var proxy = document.createElement('iframe');
        proxy.style.display = 'none';
        proxy.src = 'http://localhost:63342/proxy.html' + crossDomainData;
        document.body.appendChild(proxy);
    }
</script>
</body>
</html>
```

localhost:63342 下的 proxy.html  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>proxy.html</title>
</head>
<body>
<script type="text/javascript">
    // 因为parent.parent 和自身属于同一个域,所以可以改变其 local.hash 的值
    // 在此处把服务器端的 hash 值同步到客户端
    parent.parent.location.hash = self.location.hash.substring(1);
</script>
</body>
</html>
```

运行结果：  
![](//img.shenyujie.cc/2016-8-15-hash-success.png)
此时跨域成功  

### location.hash + iframe跨域的优点：
1. 可以解决域名完全不同的跨域
2. 可以实现双向通讯  

### location.hash + iframe跨域的缺点：  
location.hash会直接暴露在URL里，并且在一些浏览器里会产生历史记录，数据安全性不高也影响用户体验。另外由于URL大小的限制，支持传递的数据量也不大。
