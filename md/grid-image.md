---
title: Grid 布局，使用一行 CSS 实现响应式图像网格布局（翻译稿）
date: 2018-10-24 21:41:00
tags: css
categories: css
comments: true

---

![原文地址：https://medium.freecodecamp.org/how-to-make-your-html-responsive-by-adding-a-single-line-of-css-2a62de81e431](//img.shenyujie.cc/2018-10-24-grid-layout-exp1.gif)
在这一章中我们将介绍如何使用 grid 制作出一个自适应的图像网格布局，它的列的数量可以随着屏幕的宽度自动改变
<!--more-->

## 兼容性
首先我们来看下 grid 布局和 object-fit 属性的兼容性：

grid 兼容性
![](//img.shenyujie.cc/2018-10-24-grid.png)

object-fit 兼容性
![](//img.shenyujie.cc/2018-10-24-object-fit.png)

## 初始 grid 布局
我们下面先来看一下，本文用例的初始 grid 布局 ( 代码只展示 grid 布局部分 )

```
<!--html 部分-->
<div class="container">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</div>

<!--grid css 部分-->
.container {
    display: grid;
    grid-template-columns: 100px 100px 100px;
    grid-template-rows: 50px 50px;
}
```

展示效果如下：
![](//img.shenyujie.cc/2018-10-24-exp4.png)

若是对 grid 布局不熟悉的童鞋，可以先学习下 grid 的使用，下面我们来一步步拆解，如何通过 grid 实现自适应图片网格布局

## step one 使用 fr 单位实现最基础的 grid 响应式布局
fr 单位允许你把容器分割成任意的份数 ( 将轨道大小设置为网格容器自由空间的一部分，并按照 fr 的值平均分配所占空间大小 )，下面我们把上面的例子中的 `grid-template-columns` 项改用 fr 单位，代码如下：

```
.container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 50px 50px;
}
```

`grid-template-columns: 1fr 1fr 1fr` 语句将整个 `container` 容器划分成三等分，效果如下：

![](//img.shenyujie.cc/2018-10-24-grid-layout-exp2.gif)

若是我们将 `grid-template-columns` 项设置为 `1fr 2fr 1fr`，那么整个 `container` 容器将会被4等分，且中间区域将会占用总体的 2 份空间，效果如下：

![](//img.shenyujie.cc/2018-10-24-grid-layout-exp3.gif)

## step two 使用 repeat 简化 css 语句
repeat 可以简化 css 定义中重复的部分，下面我们使用 repeat 语句改写上面 `.container` css 定义，代码如下：

```
.container {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(2, 50px);
}

// 等价于：
.container {
    display: grid;
    grid-template-columns: 100px 100px 100px;
    grid-template-rows: 50px 50px;
}
```

repeat 中的第一个参数定义了重复的次数，第二个参数定义了网格的 ( 宽度/高度 )，效果和第一个效果一样，如下：

![](//img.shenyujie.cc/2018-10-24-exp4.png)

## 使用 auto-fit 自动设置容器的列数

```
.container {
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fit, 100px);
    grid-template-rows: repeat(2, 100px);
}
```

效果如下：
![](//img.shenyujie.cc/2018-10-24-grid-layout-exp4.gif)

如此，grid 布局会尽可能地根据容器的宽度调整列的数量，目前的效果和预想的很接近了，但是美中不足的是，每一个单元格的大小始终是固定的没法自适应。下面我们就将介绍如何使用 minmax 属性巧妙地使单元格的宽度能够自适应

## 使用 minmax 属性设置单元格宽度自适应

```
.container {
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-template-rows: repeat(2, 100px);
}
```

`minmax(100px, 1fr)` 使得单元格的宽度介于 100px ~ 1fr (正好等分) 之间。现在的每一列至少是 100px，但是如果有更多的可用空间，grid 网格会自动地平均分给每一个列，此时每一列的宽度不再是 100px 而是 1fr。

## 为网格增添图片

```
// 可以为网格增加图片
<div><img src="demo.jpg"/></div>

// 使用 object-fit: cover 属性，使图片自动填充网格区域
.container > div > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

最终效果如下：
![](//img.shenyujie.cc/2018-10-24-grid-layout-exp1.gif)