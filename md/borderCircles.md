---
title: CSS 背景与边框（四）之边框内圆角
date: 2017-09-18 23:29:00
tags: css
categories: css
comments: true

---
若是我们想要实现边框内圆角，这是一个有趣的效果。要简单实现很简单，直接使用两个元素就可以实现这个效果
<!--more-->
<script type="text/javascript" src="//cdn.mathjax.org/mathjax/latest/MathJax.js?config=default"></script>

## 方案一：双元素法

```
<div class="circle">
    <div>边框内圆角</div>
</div>

.circle {
    background: #655;
    padding: 8px;
}

.circle > div {
    background: #d2b48c;
    border-radius: 8px;
}
```

<iframe src="//html.shenyujie.cc/borderCircles.html" width="100%" height="220px" frameborder="0" scrolling="no"> </iframe>

这个方法虽然简便，效果也不错，但是毕竟要使用两个元素才能达成效果，有没有方法可以让我们只使用一个元素就能达到同样的效果呢？请看下文。

方案二：outline + box-shadow 法

```
background: tan;
padding: 8px;
border-radius: 8px;
text-align: center;
outline: 8px solid #655;
```

我们可以使用，`border-radius` 来实现边框圆角，再使用 outline 来实现外边框

<iframe src="//html.shenyujie.cc/borderCircles_v2.html" width="100%" height="220px" frameborder="0" scrolling="no"> </iframe>

此法可以看到虽然实现了边框内圆角，但是，圆角和外边框之间会留下白色缝隙，这是因为描边不会跟着元素的圆角走，但 box-shadow 却是会的。故而我们可以使用 box-shadow 来填充描边和容器圆角之间的缝隙。那么 box-shadow 的扩张半径应该填写多少好呢，这里给出一个答案： $${(\sqrt{2}-1)a}$$为了取值方便我们只要取值为 0.5 倍 border-radius 的值就行了，因为 ：$${\sqrt{2}-1<0.5}$$
![](//img.shenyujie.cc/2017-9-18-radius.png)
见以上分析图，这里 r 就是 border-radius 的值，则白色空隙的距离（扩张半径的最小距离则为上述所述值）

```
background: tan;
padding: 8px;
border-radius: 8px;
text-align: center;
outline: 8px solid #655;
box-shadow: 0 0 0 4px #655;
```

<iframe src="//html.shenyujie.cc/borderCircles_v3.html" width="100%" height="220px" frameborder="0" scrolling="no"> </iframe>

这样便可以使用 box-shadow 和 outline 实现边框内圆角的效果

ps：参考学习自 &lt; css 揭秘 &gt;