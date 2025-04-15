---
title: Javascript 跨域(六)之 document.domain + iframe
date: 2016-8-21 12:44:36
tags: 跨域
categories: javascript
comments: true
---
对于主域相同而子域不同的情况，可以通过设置 document.domain 的办法来解决。  
具体的做法我们可以在 http://www.shenyujie.com/a.html 和 http://m.shenyujie.com/b.html 下面共同设置 document.domain = 'shenyujie.com'，然后在 a.html 下面创建一个隐藏的 iframe，去控制 iframe 的contentDocument，这样我们就可以实现交互了  <!--more-->
( 这两个域名必须属于同一个基础域名!而且所用的协议，端口都要一致，否则无法利用document.domain进行跨域 )  

## 准备工作  
为了方便起见，我们这里使用 wamp 来构建我们的 apache 服务器，以供试验之用。  
为了完成我们的跨域实验，我们首先需要搭建环境：  

安装 wamp ，本文一键安装到 D 盘
创建两个具有相同主域而子域不同的域名  

安装完 wamp 后，我们开始配置多域名:  

进入 D:\wamp\bin\apache\Apache2.2.17\conf 文件夹下，找到 httpd.conf，打开，搜索 #Include conf/extra/httpd-vhosts.conf ，把前面的 # 去掉后保存。保存后为:  

![](//img.shenyujie.cc/2016-8-21-httpd-new.PNG)

在 D:\wamp\bin\apache\Apache2.2.17\conf\extra 文件夹下，找到 httpd-vhosts.conf ，在内容的尾部添加这两条信息  

```
<VirtualHost *:80>
    DocumentRoot "D:\wamp\www\A"
    ServerAlias www.shenyujie.com
</VirtualHost>
<VirtualHost *:80>
    DocumentRoot "D:\wamp\www\B"
    ServerAlias m.shenyujie.com
</VirtualHost>
```

在 D:\wamp\www 下新建两个站点目录，如下图：

![](//img.shenyujie.cc/2016-8-21-webroot-new.PNG)

打开 C:\Windows\System32\drivers\etc 目录下的 hosts 文件，添加域名记录，如图：  

![](//img.shenyujie.cc/2016-8-21-hostnew.PNG)

重启 wamp，即可正常访问内容：

![](//img.shenyujie.cc/2016-8-21-A-new.PNG)

可以顺利访问到 www.shenyujie.com 下的 A.html

![](//img.shenyujie.cc/2016-8-21-B-new.PNG)

可以顺利访问到 m.shenyujie.com 下的 B.html  

A.html:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>A.html</title>
</head>
<body>
<h1>this is A.html</h1>
<script type="text/javascript">
    document.domain = 'shenyujie.com';
    var ifr = document.createElement('iframe');
    ifr.style.display = 'none';
    ifr.src = 'http://m.shenyujie.com/B.html';
    ifr.onload = function () {
        var doc = ifr.contentDocument || ifr.contentWindow.document;
        console.log(doc.getElementsByTagName("h1")[0].childNodes[0].nodeValue);
    };
    document.body.appendChild(ifr);
</script>
</body>
</html>
```

B.html:

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
    document.domain = 'shenyujie.com';
</script>
</body>
</html>
```

跨域结果：  
![](//img.shenyujie.cc/2016-8-21-success-new.PNG)
设置相同的 domain 后，www.shenyujie.com 下的 A.html 能够拿到 m.shenyujie.com 下的 B.html 的内容，跨域成功。  

