---
title: JavaScript 跨域(一) 之浏览器的同源策略
date: 2016-07-28 10:54:35
tags: 跨域
categories: javascript
comments: true
---
浏览器的安全基于同源策略(same-origin policy)，根据 MDN 中对于同源策略的解释，它限制了一个源(origin)中加载文本或脚本与来自其他源(origin)中资源的交互方式。此文主要介绍同源政策，为接下去探讨跨域的一系列方式做准备。  
<!--more-->
## 同源含义
如果两个页面拥有相同的协议，端口（若指定），和主机，那么这两个页面就属于同一个源
### 同源指的三个相同
+ 协议相同（protocol）
+ 端口相同（如果指定）
+ 域名相同

### 端口协议域名解析：
#### http://www.company.com/dir/page.html 

+ 协议是 http://
+ 域名是 www.company.com
+ 端口是 80 (未指定，默认)

### 同源策略的目的
同源政策是必须的，譬如 A 网站的 cookie 中含有敏感信息，用户若是访问 A 网站后再去访问其他网站，若是无同源政策，那么其他网站便可获取用户在A网站中的信息，此时若是恰好账号密码等敏感信息存于 cookie 中，此时便会有巨大的隐患。由此可见，"同源策略"是必需的，否则 Cookie 可以共享，互联网就毫无安全可言了。

### 同源策略的限制
虽然同源策略很有必要，但是随着互联网的发展，同源策略也越来越严格。目前如果非同源，会有下面三种行为受到限制。

+ Cookie、LocalStorage 和 IndexDB 无法读取
+ DOM 无法获得
+ AJAX 请求不能发送

### 同源策略的例子

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

#### PS:有两点比较特殊
+ 如果是协议和端口造成的跨域问题无法在前端解决
+ 在跨域问题上，域仅仅是通过"URL的首部"来识别而不会去尝试判断相同的 ip 地址对应着两个域或两个域是否在同一个 ip 上, URL首部指的是：`window.location.protocol +window.location.host`

### 同源的继承
来自about:blank，javascript:和data:URLs中的内容，继承了将其载入的文档所指定的源，因为它们的URL本身未指定任何关于自身源的信息

### IE 的同源特例
在处理同源策略的问题上，IE存在两个主要的不同之处

+ 授信范围（Trust Zones）：两个相互之间高度互信的域名，如公司域名（corporate domains），不遵守同源策略的限制。
+ 端口：IE未将端口号加入到同源策略的组成部分之中，<br/>因此 http://company.com:81/index.html 和http://company.com/index.html  属于同源并且不受任何限制。

这些例外是非标准的，其它浏览器也未做出支持，但会助于开发基于window RT IE的应用程序。

