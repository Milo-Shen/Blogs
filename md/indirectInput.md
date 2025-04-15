---
title: input 的 compositionstart 和 compositionend 事件（禁止非直接输入）
date: 2017-08-24 16:28:00
tags: HTML5
categories: HTML5
comments: true

---

在 web 开发中，我们通常需要对输入的内容进行校验。这段代码虽然执行起来没有什么问题，但是会产生非直接输入，比方说我们输入“树莓派”，中间过程会输入拼音，每次输入字母都会触发input事件，然而当中文输入完成之前，都属于非直接输入。
<!--more-->

## 未禁止非直接输入
![](//img.shenyujie.cc/2017-8-24-input-noC.gif)
可以看到，当我们输入 “树莓派” 时，触发了9次 input 事件，这并非是我们想要的结果，我们希望直接输入(中文输入完成)后，再触发 input 的业务逻辑，此时就需要引入其他两个事件 compositionstart 和 compositionend 

## 事件解释
+ compositionstart
是指中文输入法开始输入触发，每次输入开始仅执行一次，执行的开始是 end 事件结束了才会触发

+ compositonupdate
是指中文输入法在输入时触发，也就是可能得到 shu'mei 这种内容，这里返回的内容是实时的，仅在 start 事件触发后触发，输入时实时触发

+ compositionend
是指中文输入法输入完成时触发，这是得到的结果就是最终输入完成的结果，此事件仅执行一次。
<span style="font-weight:bold">需要特别注意的是：该事件触发顺序在 input 事件之后，故而需要在此事件的处理逻辑里调用一次 input 里边的业务逻辑</span>

## 禁止非直接输入

```
// 添加标记位 lock ,当用户未输入完时，lock 为 true
var lock = false;
var inputEle = document.getElementById('inputEle');
// input 事件中的处理逻辑, 这里仅仅打印文本
var todo = function (text) {
    console.log(text)
};
inputEle.addEventListener('compositionstart', function () {
    lock = true;
});
inputEle.addEventListener('compositionend', function (event) {
    lock = false;
    // compositionend 事件发生在 input 之后，故此需要此处调用 input 中逻辑
    todo(event.target.value);
});
inputEle.addEventListener('input', function (event) {
    // 忽略一切非直接输入，不做逻辑处理
    if (!lock) todo(event.target.value);
});
```

![](//img.shenyujie.cc/2017-8-24-input-withC.gif)
可以看到，此时已经过滤了全部非直接输入，只有当用户输入中文结束时才会触发 input 中的业务逻辑 ~