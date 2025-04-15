---
title: 解决 HTML5 Canvas 在高分屏下的模糊问题
date: 2017-02-17 17:33:48
tags: canvas retina 兼容性
categories: canvas
comments: true
---
开发过手机 canvas 应用的同学们应该都知道，canvas 在高分屏下，尤其是手持设备，如搭载高分屏的手机平板等，其显示效果会变得模糊，带给用户的体验很不好，故此研究下如何解决这个问题。  
<!--more-->

## 问题分析
做过移动端开发的同学都知道，有一个叫做 devicePixelRatio 的属性，随着手持设备分辨率的突飞猛进，这个属性也就慢慢地登上了历史舞台。定义如下:  

>window.devicePixelRatio是设备上物理像素和设备独立像素(device-independent pixels (dips))的比例。
>公式表示就是：window.devicePixelRatio = 物理像素 / dips

  在 devicePixelRatio 为 2 的设备中，该属性决定了浏览器会用 2 个物理像素点去渲染 1 个逻辑像素点（独立像素，这里为了方便理解），以达到细腻的显示效果。举个例子，我们有一张 10 x 10 的图片，在 devicePixelRatio 为 2 的设备下，该图片实际占用 20 x 20 的物理像素大小，图片被放大到了原来的 2 倍，造成了图片的模糊失真，等于是原始图片的信息量不足以支撑实际的物理像素的信息量。  


  让我们再来看 canvas ，在 canvas 下有一个 webkitBackingStorePixelRatio 属性，该属性决定了浏览器在渲染canvas之前会用几个像素来来存储画布信息。 大部分浏览器，该值都是 1，也就是意味着，浏览染按照 4 倍 (假设 devicePixelRatio 为 2，则像素量为 2 x 2 = 4) 于实际 canvas 像素量去渲染，就造成了 canvas 的模糊，问题也因此而来。  

## webkitBackingStorePixelRatio 设备例外
  凡事都有例外，在 ios6 下，webkitBackingStorePixelRatio 的值为 2，此时 canvas 模糊的问题不存在或是得到了很大的缓解，这是因为当此 iphone 的 devicePixelRatio 也正好为 2 时，canvas 的真实像素量（信息量）正好等于屏幕的物理像素量，此时正好匹配，也就不存在模糊的问题了。所以我们进行处理时，要重新计算我们需要的像素量（信息量）的比例，不能单纯使用 devicePixelRatio 了事，而是应该使用 webkitBackingStorePixelRatio / devicePixelRatio 的比值 !  

## devicePixelRatio 和 webkitBackingStorePixelRatio 的兼容性

devicePixelRatio 的兼容性  
![devicePixelRatio 的兼容性](//img.shenyujie.cc/2017-02-17%20devicePixel%20capa.png)

webkitBackingStorePixelRatio 的兼容性：  
这个属性并没有在 caniuse 网站上查到，但是实测下来，手持设备都是支持的( chrome 和 Safari )，若是不支持，我们给予默认值 1  

## 解决方案分析
1. 首先我们计算 webkitBackingStorePixelRatio / devicePixelRatio 的比值，这里为了方便称之为倍率 ratio
2. 把 canvas 的 width 和 height 设置为 ratio 倍，这样浏览器便会按照 ratio * ratio 倍像素去渲染该 canvas
3. 我们在用 CSS 把 canvas 的大小强制再调节为原始大小
4. 使用 canvas 画布 context 的 scale 方法把渲染区域扩大 ratio 倍以填充屏幕 （ 后面会有解释 ）
5. 这样就达成了我们的目的

## 步骤分解
1. 原始状态，上面一张图是 `<img>` 标签引入的原图，下面一张是 canvas 加载的图片
![原始图片](//img.shenyujie.cc/2017-2-17-a.png)
可以看到 `<img>` 标签引入的图很清晰，但是相同的图片用 canvas 加载就模糊了
2. 对 canvas 进行处理，我们先进行 上面解决方案分析里面的 1 ~ 4步，代码如下 ：  
获取 ratio 比例的代码

```
function getPixelRatio(context) {
    // 获取 canvas 的 backingStorePixelRatio 值
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    // 若 devicePixelRatio 不存在，默认为 1
    return (window.devicePixelRatio || 1) / backingStore;
}
```

调整 canvas 的代码  

```
function adjustCanvas(canvas, context) {
    var ratio = getPixelRatio(context);
    // 获取 canvas 的原始大小
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    // 按照比例放大 canvas
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    // 用 css 将 canvas 再调整成原来大小
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
}
```

实验结果:
![](//img.shenyujie.cc/2017-2-17-canvas-step1.png)
灰色部分是整个 canvas 的区域，这个例子里 ratio ( webkitBackingStorePixelRatio / devicePixelRatio ) 为 2，我们发现经过如此处理后，canvas 的实际绘图区域 (context区域) 只有原来的 1/4 ，这是由于 css 缩放后造成的结果。所以我们还需要进一步处理，此时 context 里面有一个缩放方法 scale，我们按照先前缩放的 ratio 比率在放大回来即可 `context.scale(ratio, ratio);`   
完善后的代码:  

```
function adjustCanvas(canvas, context) {
    var ratio = getPixelRatio(context);
    // 获取 canvas 的原始大小
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    // 按照比例放大 canvas
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    // 用 css 将 canvas 再调整成原来大小
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    // 按照比率把 context 再缩放回来
    context.scale(ratio, ratio);
}
```

#### 结果图：
![](//img.shenyujie.cc/2017-2-17-b.png)
可以看到和最初比起来清晰了好多  

#### 和 img 标签加载的图片对比（上图img，下图处理后的 canvas)
![](//img.shenyujie.cc/2017-2-17-c.png)
可以看到处理后的 canvas（下图）的清晰度已经和 img 标签引入的方式别无二致了，目的达成。  

### 完整代码:

```
function getPixelRatio(context) {
    // 获取 canvas 的 backingStorePixelRatio 值
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    // 若 devicePixelRatio 不存在，默认为 1
    return (window.devicePixelRatio || 1) / backingStore;
}

function adjustCanvas(canvas, context) {
    var ratio = getPixelRatio(context);
    // 获取 canvas 的原始大小
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    // 按照比例放大 canvas
    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;
    // 用 css 将 canvas 再调整成原来大小
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    // 按照比率把 context 再缩放回来
    context.scale(ratio, ratio);
}
```

### 调用:

```
// 此处默认你的 canvas 已经是你要的实际尺寸
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
adjustCanvas(canvas, ctx);
```
### H5 游戏中的应用
本人暂时在本来生活网，之前写过一个 H5 的小游戏，正好拿此做例子，演示下此方法在游戏中的应用（以下链接请在手机中访问，这里设定了游戏执行时间为 30 秒）
[未经过 retina 处理](//html.shenyujie.cc/unusedRetina.html)
链接: //html.shenyujie.cc/unusedRetina.html
[已经过 retina 处理](//html.shenyujie.cc/usedRetina.html)
链接: //html.shenyujie.cc/usedRetina.html
