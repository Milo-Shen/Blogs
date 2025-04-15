---
title: Javascript 跨域(七) 之 postMessage
date: 2016-8-22 14:16:38
tags: 跨域
categories: javascript
comments: true
---
postMessage 方法允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本文档、多窗口、跨域消息的传递。[MDN介绍](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)<!--more-->　　
## 语法：
otherWindow.postMessage(message, targetOrigin);  

+ otherWindow
其他窗口的一个引用，比如iframe的contentWindow属性、执行window.open返回的窗口对象、或者是命名过或数值索引的window.frames

+ message
要传递的数据，html5规范中提到该参数可以是JavaScript的任意基本类型或可复制的对象，然而并不是所有浏览器都做到了这点儿，部分浏览器只能处理字符串参数，所以我们在传递参数的时候需要使用JSON.stringify()方法对对象参数序列化，在低版本IE中引用json2.js可以实现类似效果  

+ targetOrigin
字符串参数，指明目标窗口的源，协议+主机+端口号[+URL]，URL会被忽略，所以可以不写，这个参数是为了安全考虑，postMessage()方法只会将message传递给指定窗口，当然如果愿意也可以建参数设置为"*"，这样可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"  

## 准备工作：
服务器的搭建[参照](http://shenyujie.pub/2016/08/21/Javascript%E8%B7%A8%E5%9F%9F-%E5%85%AD-%E4%B9%8B-document-domain-iframe/)，这里和上一章一样，我们使用 www.shenyujie.com/A.html 下的 A.html 和 m.shenyujie.com/B.html 下的 B.html  

## 实现代码：
A.html：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>A.html</title>
</head>
<body>
<h1>this is A.html</h1>
<iframe id="ifr" src="http://m.shenyujie.com/B.html"></iframe>
<script type="text/javascript">
    window.onload = function () {
        var iframe = document.getElementById('ifr');
        var targetOrigin = 'http://m.shenyujie.com';
        iframe.contentWindow.postMessage('I am A.html!', targetOrigin);
    }
</script>
</body>
</html>
```

B.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>B.html</title>
</head>
<body>
<h1>this is B.html</h1>
<script type="text/javascript">
    window.addEventListener('message', function (event) {
        // chrome 浏览器下，origin property 是 event.originalEvent
        var origin = event.origin || event.originalEvent.origin;
        if (origin !== 'http://www.shenyujie.com') return;
        console.log(event.data);
    }, false);
</script>
</body>
</html>
```

运行结果：  
![](//img.shenyujie.cc/2016-8-22-postmessage.PNG)
此时 B.html 可以收到跨域来的消息  

PS：　　

+ IE6 、IE7不支持
+ chrome 浏览器下，origin property 是 event.originalEvent，故需要做兼容性处理：`var origin = event.origin || event.originalEvent.origin;`
