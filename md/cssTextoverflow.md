---
title: CSS 之多行文本溢出显示省略号
date: 2018-8-5 13:45:00
tags: css
categories: css
comments: true

---

前言：我们通常使用 text-overflow:ellipsis 来对单行文本的溢出进行处理，但是面对多行文本时，这种方式并不奏效，下面我们来介绍一下针对多行文本溢出的解决办法

<!--more-->

## -webkit-line-clamp 方案

```
overflow : hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-line-clamp: 6;
-webkit-box-orient: vertical;
```

效果：  

<iframe src="https://html.shenyujie.cc/2018-8-5-1.html" width="100%" height="250px" frameborder="0" scrolling="no"></iframe>

注意点 : 此方案只能用于 webkit 内核的浏览器，故而推荐移动端使用

## line-height + 伪元素方案

```
.hide {
    position: relative;
    overflow: hidden;
    line-height: 25px;
    height: 150px;
}

.hide:after {
    content:"...";
    font-weight:bold;
    position:absolute;
    bottom:0;
    right:0;
    padding:0 20px 1px 45px;
    background:url(https://img.shenyujie.cc/2018-8-5-ellipsis_bg.png) repeat-y;
}
```

需要注意的是这里，我们使用伪类模拟出 ... 的效果的同时，容器 height 的高度必须是 line-height 的倍数，倍数即为显示的行数。假如 height 是 line-height 的 4倍大小，则该容器可以显示 4 行文字，多于的以省略号结束，效果如下:  


<iframe src="https://html.shenyujie.cc/2018-8-5-2.html" width="100%" height="250px" frameborder="0" scrolling="no"></iframe>  

上述例子中，我们还是用了一张透明色的渐变，来让显示省略号的过度不那么生硬，下面我们把蓝色，红色底全部换成白色底，把透明色 png 换成 css 渐变的写法，来让我们的示例显得更自然： 

<iframe src="https://html.shenyujie.cc/2018-8-5-4.html" width="100%" height="250px" frameborder="0" scrolling="no"></iframe>  

以上便是最终效果。