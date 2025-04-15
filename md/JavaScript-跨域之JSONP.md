---
title: JavaScript 跨域(二) 之 JSONP
date: 2016-07-29 11:39:40
tags: 跨域
categories: javascript
comments: true
---
浏览器的同源策略在保障了我们的数据安全，但是在进行一些比较深入的前端编程的时候却略显苛刻。JSONP 的跨域 GET 请求是一个常用的解决方案，下面我们来看一下 JSONP 是如何实现的，并探讨下 JSONP 的跨域原理  
<!--more-->
## JSONP 的定义
Jsonp(JSON with Padding) 是 json 的一种"使用模式"，可以让网页从别的域名（网站）那获取资料，即跨域读取数据
## JSONP 的原理
通过动态插入一个script标签。浏览器对 script 的资源引用没有同源限制，同时资源加载到页面后会立即执行（没有阻塞的情况下）
## JSONP 的使用
### 1. 服务端JSONP格式数据
这里以 PHP 为例子 : 
PS : 使用的是 W3C 的服务端例子，可以访问:  
[http://www.runoob.com/try/ajax/jsonp.php?jsonp=callbackFunction](http://www.runoob.com/try/ajax/jsonp.php?jsonp=callbackFunction)

```
<?php
header('Content-type: application/json');
//获取回调函数名
$jsoncallback = htmlspecialchars($_REQUEST ['jsoncallback']);
//json数据
$json_data = '["customername1","customername2"]';
//输出jsonp格式的数据
echo $jsoncallback . "(" . $json_data . ")";
?>
```
### 2. 客户端实现 callbackFunction 函数

```
<script type="text/javascript">
function callbackFunction(result, methodName)
{
    var html = '<ul>';
    for(var i = 0; i < result.length; i++)
    {
        html += '<li>' + result[i] + '</li>';
    }
    html += '</ul>';
    document.getElementById('divCustomers').innerHTML = html;
}
</script>
```

### 3. 客户端页面完成展示
ps:服务端使用 w3c 的实现

```
<div id="divCustomers"></div>
<script type="text/javascript">
    function callbackFunction(result, methodName) {
        var html = '<ul>';
        for (var i = 0; i < result.length; i++) {
            html += '<li>' + result[i] + '</li>';
        }
        html += '</ul>';
        document.getElementById('divCustomers').innerHTML = html;
    }
</script>
<script type="text/javascript" src="http://www.runoob.com/try/ajax/jsonp.php?jsoncallback=callbackFunction"></script>
```

### 4. JS代码中插入 script 标签进行跨域
简易版本 : 

```
var _script = document.createElement('script');
_script.type = "text/javascript";
_script.src = "http://www.runoob.com/try/ajax/jsonp.php?jsonp=callbackFunction";
document.head.appendChild(_script);
```
详细版本 : 

```
// 根据特定的 URL 发送 JSONP 请求
// 然后把解析得到的相应数据传递给回调函数
// 在 URL 中添加一个名叫 JSONP 的查询参数,用于指定该请求的回调函数的名称
function getJSONP(url, callback) {
    // 为本次请求创建一个唯一的回调函数名称
    // 每次自增计数器
    var cbnum = "cb" + getJSONP.counter++;
    // 作为 JSONP 函数的属性
    var cbname = "getJSONP." + cbnum;
    // 将回调函数名称以表单编码的形式添加到 URL 的查询部分中
    // 使用 JSONP 作为参数名,一些支持 JSONP 的服务
    // 可能使用其他的参数名,比如 callback
    if (url.indexOf("?") === -1) {
        // 若 URL 没有查询部分,则作为查询部分添加参数
        url += "?jsonp=" + cbname;
    } else {
        // 否则作为新的参数添加它
        url += "&jsonp=" + cbname;
    }
    // 创建 script 元素用于发送请求
    var script = document.createElement("script");
    // 定义将被外部脚本执行的回调函数
    getJSONP[cbnum] = function (response) {
        try {
            // 处理相应的数据
            callback(response);
        }
        finally {
            // 删除该函数
            delete getJSONP(cbnum);
            // 移除 script 元素
            script.parentNode.removeChild(script);
        }
    };
    // 立即触发 HTTP 请求
    // 设置脚本的 URL
    script.src = url;
    // 把它添加到文档中
    document.body.appendChild(script);
}
// 用于创建唯一回调函数名的计数器
getJSONP.counter = 0;
```


### 5. jQuery 中使用 JSONP

```
$.getJSON("http://www.runoob.com/try/ajax/jsonp.php?jsoncallback=?", function (data) {
    // 对 data 进行处理
});
```

## 脚本和安全性
为了使用 `<script>` 标签进行 Ajax 传输，必须允许 web 页面执行远程服务器发送过来的任何 JavaScript 代码。这意味着对于不可信任的服务器，不应该采用该技术。需要注意的是，这种技术普遍用于可信任的第三方脚本，特别是在页面中嵌入广告和组件。所以使用前要确保第三方组件足够安全。

## JSONP 的缺点

+ 这种方式无法发送post请求 [详情](http://stackoverflow.com/questions/3860111/how-to-make-a-jsonp-post-request-that-specifies-contenttype-with-jquery)
+ 无法明确判定此次请求是否成功（大多数框架使用超时时间来模拟）
+ 需要用户传递一个`callback`参数给服务端

