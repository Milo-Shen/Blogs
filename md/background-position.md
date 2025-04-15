---
title: CSS 背景与边框（三）之背景定位
date: 2017-08-30 14:27:00
tags: css
categories: css
comments: true

---

在以往，我们若想针对某个容器某个角对背景图片做偏移定位，在 css2.1 的规范中，我们只能指定背景相对于左上角的偏移量，或是完全靠齐其他三个角。如今随着 CSS3 的出现，我们有了更加灵活的定位方式。

<!--more-->

## background-position 方案
在 CSS3 中，background-position 属性得到了增强，它允许我们指定背景图片距离任意角的偏移量，只要我们在偏移量前指定关键字

兼容性：
![](//img.shenyujie.cc/2017-08-30-background-position.png)

```
background: url("blackboard.svg") no-repeat bottom right / 100px 100px #5588aa;
background-position: right 20px bottom 10px;
```

<iframe src="//html.shenyujie.cc/background-position.html" width="100%" height="250px" frameborder="0" scrolling="no"> </iframe>

## background-origin 方案
若是要求背景图片的偏移量需要和容器的内边距相等时，若是继续采用 background-position 法，我们就不得不改动 padding 和 background-position 中的三处偏移量值，比较麻烦，代码如下：

```
padding: 10px;
background: url("blackboard.svg") no-repeat bottom right / 100px 100px #5588aa;
background-position: right 10px bottom 10px;
```

每次改变内边距的值时，不得不手动修改 background-position 的值，比较麻烦，所以 background-origin 的方法便有了用武之地，它使得我们的背景自动更随设定的 padding 走，而不需要额外声明偏移量的值

### 兼容性：
![](//img.shenyujie.cc/2017-08-30-background-origin.png)

### 用法： 
`background-origin: padding-box|border-box|content-box`

### 参数解析:
| 值            | 属性                                        |
| ------------- |:------------------------------------------- |
| padding-box   | 背景图像相对于内边距框来定位                |
| border-box    | 背景图像相对于边框盒来定位                  |
| content-box   | 背景图像相对于内容框来定位                  |

默认 background-origin 的值是 padding-box，若是我们把 background-origin 的值改成 content-box ，则背景属性中使用的边角关键字会以内容区的边缘作为基准，也就是说背景图片距离边角的偏移量与内边距保持一致了

```
padding: 10px;
background: url("blackboard.svg") no-repeat bottom right / 100px 100px #5588aa;
background-origin:content-box;
```

<iframe src="//html.shenyujie.cc/background-origin-v2.html" width="100%" height="270px" frameborder="0" scrolling="no"> </iframe>

## calc 方案
当然我们也可以简单地使用 calc 来计算背景坐标并进行定位

### 兼容性：
![](//img.shenyujie.cc/2017-8-30-calc-small.png)

```
background: url("blackboard.svg") no-repeat bottom right / 100px 100px #5588aa;
background-position: calc(100% - 20px) calc(100% - 10px);
```

<iframe src="//html.shenyujie.cc/baground-calc.html" width="100%" height="250px" frameborder="0" scrolling="no"> </iframe>

PS: 本篇参考自 CSS 解密 & caniuse 网站