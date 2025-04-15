---
title: CSS 背景与边框（一）之多重边框
date: 2017-08-28 18:30:00
tags: css
categories: css
comments: true

---

相比于多背景而言，多重边框暂时还没有直接的 CSS 特性予以支持。虽说可以通过 border-image 来实现想要的效果，然而工作中，我们更加希望可以灵活地通过 CSS 代码来调整边框样式，避免频繁地更换 border 图片。为了达到这一目的，多元素模拟多重边框等等 hack 技术便被制造出来，但是也带来了引入冗余元素的麻烦，以下我们推荐两种更好的方式实现多重边框，而不需要添加多余的元素来 hack 实现。
<!--more-->

## box-shadow 方式
### 兼容性：
![](//img.shenyujie.cc/2017-8-28-box-shadow-compatibility.PNG)
### 用法：

```
box-shadow: h-shadow v-shadow blur spread color inset;
```

### 参数解析:
| 值            | 属性                                        |
| ------------- |:------------------------------------------- |
| h-shadow      | 必需。水平阴影的位置。允许负值              |
| v-shadow      | 垂直阴影的位置。允许负值                    |
| blur          | 可选。模糊距离                              |
| spread        | 可选。阴影的尺寸                            |
| inset         | 可选。将外部阴影 (outset) 改为内部阴影      |

此处我们要使用的正是 box-shadow 的第四个可选属性 spread (或称扩张半径)，通过制定正负值，可以让投影面积增大或缩小，一个正值的扩张半径 spread，加上两个为零的偏移量 ( h-shadow 和 v-shadow ) 和同样为零的模糊距离 blur， 得到的阴影从视觉上来说就是一条实线边框

```
background: lightgreen;
box-shadow: 0 0 0 10px #655;
```

<iframe src="//html.shenyujie.cc/box-shadow-single.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

乍看下来，并没有什么特别的地方，这个效果用 border 属性完全可以实现，不过其神奇之处在于：<span style="font-weight:bold">box-shadow 属性支持逗号分隔语法，故而我们可以创建任意数量的投影</span>

```
background: lightgreen;
box-shadow: 0 0 0 10px #655, 0 0 0 20px pink;
```

这里需要注意的是：box-shadow 的效果是层层叠加的，第一次投影位于最顶层，以此类推。我们需要按此规律来调整 spread （扩张半径）的值。举例子来说，若是我们想在上述的例子基础上再加上一个 10px 的粉红色外框，则需要指定扩张半径的值为 20px （10px + 10px）

<iframe src="//html.shenyujie.cc/box-shadow-multi.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

如果愿意，甚至可以在外圈再加一道常规投影

<iframe src="//html.shenyujie.cc/box-shadow-final.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>
  

box-shadow 的方案在大多数情况下都能正常工作，但是有一些注意点：

+ 只能模拟出实线边框
+ 投影和边框不完全一样，它不会影响布局，不占据文档流空间，同理也不会受到 box-sizing 属性的影响
+ 投影模拟出的边框并不会响应鼠标事件，如有需要，请使用内阴影实现，即给 box-shadow 属性加上 inset 关键字

## outline 方式
若是你只需要<span style="font-weight:bold">两层边框，</span>且边框线的类型也不仅仅拘泥于实现边框的话，倒是不妨可以试试 outline 的方式

### 兼容性
![](//img.shenyujie.cc/2017-8-28-outline-compatibility.PNG)

### 用法：

```
outline: color style width;
outline-offset: width  // Internet Explorer 和 Opera 不支持 support outline-offset 属性
```

### 参数解析:
| 值         | 属性                      |
| ---------- |:------------------------- |
| color      | 设置边框颜色              |
| style      | 设置边框样式              |
| width      | 设置边框宽度              |
| offset     | 设置边框轮廓              |
<span style="font-weight:bold">下面使用 outline 实现多边框：</span>

```
background: lightgreen;
border: 10px solid #655;
outline: 10px solid pink;
```

<iframe src="//html.shenyujie.cc/outline.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

<span style="font-weight:bold">我们还可以使用 outline-offset 实现缝边效果( offset 指定为负值 )</span>

```
background: #655;
border-radius: 5px;
outline: 2px dashed #FFFFFF;
outline-offset: -15px;
```

<iframe src="//html.shenyujie.cc/outline-edge.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

<span style="font-weight:bold">使用 outline 实现的边框不会贴合元素的圆角（暂时）</span>

```
background: lightgreen;
border: 10px solid #655;
border-radius: 15px;
outline: 10px solid pink;
```

<iframe src="//html.shenyujie.cc/outline-radius.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

和 box-shadow 方案一样，使用 outline 实现多重边框也有一些注意事项：

+ 仅适用于双层边框场景，outline 不能接受多个值
+ 边框不一定会贴合 border-radius 属性产生的圆角
+ outline 同样不占据文档流空间
