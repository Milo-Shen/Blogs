---
title: 简单尝试下 JS 中点击（单击）事件的触发顺序
date: 2017-03-08 16:24:20
tags: html
categories: html
comments: true
---
最近突发奇想，要是在同一个元素上同时绑定不同的点击事件（同一时刻触发），此时就有必要明确同一次点击事件时各个事件的触发顺序，这边先从简单的尝试起
<!--more-->

## 事件选取
这里我们选取的单击事件一共是5种:touchstart , touchend , onmousedown , onmouseup , click  

因为 click 有 300 毫秒延迟的问题，所以最主要就是比较 touchstart 和 onmouseup 的优先级顺序，测试代码如下：  

```
  var count = 1;
    var oDom = document.getElementById('oDiv');
    oDom.addEventListener('click', function () {
        console.log("click 事件位于第: " + count++ + "顺序触发");
    }, false);
    oDom.addEventListener('touchstart', function () {
        console.log("touchstart 事件位于第: " + count++ + "顺序触发");
    }, false);
    oDom.addEventListener('touchend', function () {
        console.log("touchend 事件位于第: " + count++ + "顺序触发");
    }, false);
    oDom.addEventListener('mousedown', function () {
        console.log("mousedown 事件位于第: " + count++ + "顺序触发");
    }, false);
    oDom.addEventListener('mouseup', function () {
        console.log("mouseup 事件位于第: " + count++ + "顺序触发");
    }, false);
```

结果 ：  
![](//img.shenyujie.cc/2017-3-8-event.png)

所以事件触发的顺序是：  
touchstart -> touchend -> mousedown -> mouseup -> click


