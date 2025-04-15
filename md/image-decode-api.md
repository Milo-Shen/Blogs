---
title: 使用 Image Decode API 优化前端滚屏性能
date: 2018-9-8 14:32:00
tags: [js,性能优化]
categories: [js,性能优化]
comments: true

---

前言：图片的解码过程会造成动画卡顿，给我们在使用定时器或是 RAF 制作动画时带来不便。那么我们是否可以先不插入图片，等到图片解码完成后再往 DOM 树里插入图片参与绘制？ `Image Decode API ` 使我们的想法成为现实。

<!--more-->

## 预备知识 —— 图片解码缓存（  ImageDecodeCache ）
浏览器会使用 ImageDecodeCache 来缓存图片解码后的数据文件。如果一个图片已经在缓存中，它就不需要被重复解码。然而图片解码缓存的大小也是有限制的（ 移动端最大为 128M ），只能容纳有线的图片。如果一个图片被移出可视区并且长时间没有参与绘制，那么将被 ImageDecodeCache 淘汰 ( 采用 MRU 算法 )

## 优化的思路
1. 当图片将在完成需要在可视区展示时，先发起解码请求，等待解码完成后再插入 DOM 中（ 可与懒加载相配合 ）
2. 当一个图片长时间未出现在可视区时，可以先移除该图片，再用占位符代替它，直到它再次进入可视区。

## 语法
decode 返回的是一个 promise 对象，故而我们需要使用 rejected/resolved 回调来处理，或是使用 async await 来处理( 若是浏览器支持 async 语法的话 )

```
// 使用 rejected/resolved 回调处理图片
var img = new Image();
img.src = "https://img.shenyujie.cc/2018-8-8-kimi-45.PNG";
img.decode().then(
    function (succ) {
        // 解码成功的回调
        document.body.appendChild(img);
    }, function (err) {
        // 解码失败的回调
        console.log('图片无法被解码', err)
    });
    
// 使用 async await 语法 （ 需要浏览器支持 ）
 async function decodeImage() {
    var img = new Image();
    img.src = "https://img.shenyujie.cc/2018-8-8-kimi-45.PNG";
    try {
        await img.decode();
        document.body.appendChild(img);
    } catch (e) {
        // 若是解码失败，则在此处做相应处理
        console.log('图片无法被解码', e)
    }
}
decodeImage();
```
