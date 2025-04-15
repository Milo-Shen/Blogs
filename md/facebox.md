---
title: CSS 背景与边框（二）之半透明边框
date: 2017-08-29 14:25:00
tags: css
categories: css
comments: true

---


2009年伊始，半透明色被正式纳入前端开发的范畴，从此以后我们终于可以在页面中应用半透明色了，诸如 rgba()，hsla() 等属性，但是我们要注意做好回退，IE下甚至需要使用滤镜来 hack 模拟，下面我们看看如何实现半透明边框。

<!--more-->

我们现在对一个容器设置一个白色背景和半透明白色边框，我们最开始可能这么写：

```
background: white;
border: 10px solid hsla(0, 0%, 100%, 0.5);
```

<iframe src="//html.shenyujie.cc/facebox-hsla.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

这时候我们发现，我们看不见这个边框，不要着急，其实这个边框是存在的，下面我们尝试着，把容器的背景色从白色换成绿色，并且我们为了好作区分，把边框从实线改成了虚线，就可以看到这个边框了

<iframe src="//html.shenyujie.cc/facebox-hsla-withbg.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>

我们看到边框线出来了，但是背景的绿色从半透明白色的边框线上透了上来，使得边框线变成了浅绿色，这显然不是我们想要的效果，我们想要的一直都是浅白色的半透明边框线，要达到这一步目的，我们可以使用 `background-clip: padding-box` 属性让浏览器根据容器内边距的外沿把对背景进行裁剪，这样一来便可实现预期效果  

background-clip 兼容性：
![](//img.shenyujie.cc/2018-8-19-background-clip.png)

修改后的代码如下：

```
background: lightgreen;
border: 10px solid hsla(0, 10%, 100%, 0.5);
background-clip: padding-box;
```

如此，便完成了预期的目标，效果如下：

<iframe src="//html.shenyujie.cc/facebox-final.html" width="100%" height="170px" frameborder="0" scrolling="no"> </iframe>