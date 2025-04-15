---
title: Passive Event Listeners  优化移动端滑动性能
date: 2018-8-30 20:45:00
tags: javascript
categories: javascript
comments: true

---

前言： Passive Event Listeners 可以用于提升移动端滑动的流畅度，也可以同于解决新版 chrome 阻止 touchmove 默认事件时的 treated as passive 错误，下面让我们来看一下 Passive Event Listeners 的用法

<!--more-->

## 加入 Passive Event Listeners 的目的
移动端，当开发者使用 touch 类事件 ( 例如: touchstart, touchmove ) 时， 在事件绑定执行完之前，浏览器无法得知开发者是否调用了事件的 `preventDefault` 方法，故而只能等待事件绑定执行完 ( 譬如 200ms ) 之后，浏览器才会最终知道开发者到底有没有 `preventDefault`，那这 200ms 的等待时间就会造成用户操作上的延迟。google 加入 Passive Event Listeners 这项特性就是希望，开发者一开始就告诉浏览器我是否需要 `preventDefault`，以便消除这个等待时间。

## Passive Event Listeners 实现的方式
1. addEventListener 第三个参数 option 填写 { passive: true }
2. css 中对可滑动区域明确指定 `touch-action: manipulation` 或者 `touch-action: none`

## Passive Event Listeners 可以解决的 bug
在新的浏览器中 ( 例如: chrome, safari ) ，若是在 touchmove 中，我们调用 preventDefault 阻止了默认事件，那么浏览器会提示 `treated as passive` 错误，如下图：  
![](//img.shenyujie.cc/2018-08-29-passive.png)

### 错误产生的原因：
1. 这是由于新版本的浏览器 ( chrome 56 之后 & safari ) 更新了一项新的特性，这项特性的初衷是为了让页面的滑动变得更为流畅。  
2. 同上文 " 加入 Passive Event Listeners 的目的 "
3. 据 Google 统计，平均 80% 的网页会因为 浏览器的这个特性，造成大约 100ms 左右的延迟，部分甚至能到 500ms，故而才加入 Passive 这个特性来解决此问题

## 申明 Passive 前后 Google 官方的性能对比测试
1. 因为需要梯子，故而做成了 gif 文件，[原地址](https://www.youtube.com/watch?v=NPM6172J22g)
2. 左侧未申明 passive 的情况，右侧为申明了 passive 的情况，可以看到，明显右侧更加流畅
![](https://img.shenyujie.cc/2018-08-29-touch-action.gif)

## 实现 Passive Event Listeners 之 touch-action
功能介绍： touch-action 属性用于指定，以何种方式，在给定的区域，用户可以通过触摸屏执行的操作（例如，通过平移或缩放内置的浏览器功能）

### touch-action 浏览器兼容性
我们先来看一下总体的支持情况：
![](https://img.shenyujie.cc/2018-8-29-touch-action.png)
可以看到，手机端基本都是支持了的，除了 ios 的 safari 只支持部分特性。  
所幸 ios 和 chrome 下都支持的属性有 touch-action: auto 和 touch-action: manipulation，我们用这两个属性就够了。  

1. touch-action: auto 当触控事件发生在元素上时，由浏览器来决定进行哪些操作，比如对viewport进行平滑、缩放等
2. touch-action: manipulation 浏览器只允许进行滚动和持续缩放操作。任何其它被auto值支持的行为不被支持。启用平移和缩小缩放手势，但禁用其他非标准手势，例如双击以进行缩放。

### touch-action 具体使用例子
我们就先用 `touch-action: manipulation` 来解决 `treated as passive` 报错，我们在 body 上加上以下样式

```
touch-action: manipulation;
```

此时当我们执行 `preventDefault` 时，浏览器就不会再报 `treated as passive` 错误了，并且也没有了 100ms 左右的等待时间

## 实现 Passive Event Listeners 之直接传递 { passive: true }

我们先来看一下 addEventListener 的参数签名

```
target.addEventListener(type, listener[, options]);
target.addEventListener(type, listener[, useCapture]);
```

1. useCapture 为选填，true 为事件捕获阶段，false 为冒泡阶段
2. options 参数也为选填，是最近的 DOM 规范中才加入的，可以传入 { passive: true } 来明确告诉浏览器，不会调用 `preventDefault` 方法。当然也可传入 passive 为 false， 明确使用 `preventDefault`
3. 在 Chrome 浏览器中，如果发现耗时超过 100 毫秒的非 passive 的监听器，会在 DevTools 里面警告你加上 {passive: true}

Chrome 51 和 Firefox 49 以及之后的版本已经支持 passive 属性。如果浏览器不支持，可以使用下面的 polyfill：

```
// Test via a getter in the options object to see 
// if the passive property is accessed
var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("test", null, opts);
} catch (e) {}

// Use our detect's results. 
// passive applied if supported, capture will be false either way.
elem.addEventListener(
  'touchstart',
  fn,
  supportsPassive ? { passive: true } : false
); 
```

上面的方法比较巧妙，先使用 defineProperty 定义一个 passive 属性，若是浏览器支持该属性，则下面执行绑定事件 `window.addEventListener("test", null, opts);` 的时候，浏览器就会读取 passive 属性，此时就会被我们定义的 get 拦截器拦截，此时我们就可以认为浏览器支持 passive。因为若是不支持，浏览器就不会去读取 passive 属性，自然也就不可能被 get 拦截到，此时我们的代码就可以改成如下所示：

```
document.addEventListener('touchmove', function (e) {
    // 业务代码
}, {passive: true});
```

上面需要注意的是：传入参数 `{passive: true}` 后就不要再调用 `preventDefault` 了，因为已经明确告诉浏览器，事件处理函数中，我不会去调用 `preventDefault` 了。要真的这么做了，浏览器会报错误 : `Unable to preventDefault inside passive event listener invocation.`

以上就是 Passive Event Listeners 的全部内容