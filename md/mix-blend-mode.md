---
title: 谈谈颜色混合模式 mix-blend-mode 和 background-blend-mode
date: 2018-9-5 14:32:00
tags: css
categories: css
comments: true

---

前言：CSS3 中新增了一个有意思的属性 mix-blend-mode，描述了元素的内容应该与元素的直系父元素的内容，元素的背景如何混合，或是多个元素重叠部分的颜色如何混合，熟悉 PhotoShop 的人应该对混合模式不陌生，得益于技术的进步，我们在网页中也可以使用这个效果了~
<!--more-->

## 关于混合模式
使用过 PhotoShop 的童鞋肯定对混合模式不陌生  
![](https://img.shenyujie.cc/2018-9-4-ps.png)
更多信息可以查看维基百科上关于[混合模式](https://en.wikipedia.org/wiki/Blend_modes)的介绍。

## 关于 mix-blend-mode
该属性的作用描述了元素的内容应该与元素的直系父元素的内容，元素的背景如何混合，或是多个元素重叠部分的颜色如何混合，我们先看一下它的兼容性。
![](https://img.shenyujie.cc/2018-9-4-mix-blend-mode-can-i-use.png)
可以看到，PC 端，IE系列浏览器还是一如既往的不支持，不过好在移动端的兼容性基本没问题，还是有一席用武之地的，并且该属性无需使用私有前缀，即可使用。

## mix-blend-mode 支持的属性

+ mix-blend-mode: normal 正常
+ mix-blend-mode: multiply 正片叠底
+ mix-blend-mode: screen 滤色
+ mix-blend-mode: overlay 叠加
+ mix-blend-mode: darken 变暗
+ mix-blend-mode: lighten 变亮
+ mix-blend-mode: color-dodge 颜色减淡
+ mix-blend-mode: color-burn 颜色加深
+ mix-blend-mode: hard-light 强光
+ mix-blend-mode: soft-light 柔光
+ mix-blend-mode: difference 差值
+ mix-blend-mode: exclusion 排除
+ mix-blend-mode: hue 色相
+ mix-blend-mode: saturation 饱和度
+ mix-blend-mode: color 颜色
+ mix-blend-mode: luminosity 亮度
+ mix-blend-mode: initial 初始
+ mix-blend-mode: inherit 继承
+ mix-blend-mode: unset 复原

## 混合模式 mix-blend-mode 的效果
<iframe src="https://html.shenyujie.cc/2018-9-4-mix-1.html" frameborder="0" scrolling="no" width="800px" height="400px"></iframe>


## 混合模式 mix-blend-mode 的不同属性 demo
下面我们来看一些使用 mix-blend-mode 可以做到的实际效果，首先我们看一下原图：  
### 原图
![](https://img.shenyujie.cc/2018-9-4-house-exp.jpg)

### 铅笔画效果
<iframe src="https://html.shenyujie.cc/2018-9-4-mix-3.html" frameborder="0" scrolling="no" width="800px" height="550px"></iframe>

### 彩笔画效果
<iframe src="https://html.shenyujie.cc/2018-9-4-mix-2.html" frameborder="0" scrolling="no" width="800px" height="550px"></iframe>

### 彩笔画效果
<iframe src="https://html.shenyujie.cc/2018-9-4-mix-4.html" frameborder="0" scrolling="no" width="800px" height="550px"></iframe>

## 关于 background-blend-mode
该属性为背景的混合模式，可以是背景图片间（多背景）的混合，也可以是背景图片和背景色的混合，支持的属性值范围和 mix-blend-mode 一致，下面我们看一下 background-blend-mode 的兼容性：
![](https://img.shenyujie.cc/2018-9-4-background-blend-mode-can-i-use.png)

## background-blend-mode 的不同属性 demo
<iframe src="https://img.shenyujie.cc/2018-9-4-background-blend-mode.html" frameborder="0" scrolling="no" width="1000px" height="650px"></iframe>
