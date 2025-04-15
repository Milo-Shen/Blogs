---
title: 使用 drop-shadow 任意改变 png 默认颜色
date: 2018-8-31 11:25:00
tags: css
categories: css
comments: true

---

前言：工作的时候，对于纯色 ico，若是需要改变 ico 颜色，我们不得不替换图片，很麻烦。但是使用 drop-shadow 属性，我们就可以任意改变 png 颜色，对于维护方面是一个很大的利好

<!--more-->

## drop-shadow 的用途
drop-shadow 是 filter 滤镜的一种，用于给盒子模型添加阴影

## drop-shadow 兼容性
由于 drop-shadow 是 filter 滤镜的一种，故而 caniuse 网站无法单独查询 drop-shadow 的兼容性，所以下面展示的是 filter 本身的兼容性。对于 drop-shadow 自身的兼容性，实测下来，edge 浏览器, chrome, ios safari, android 4.4 及其以上机型都是支持的
![](https://img.shenyujie.cc/2018-8-30-drop-shadow.png)

## drop-shadow 的用法

```
// 其中 spread-radius 虽然 mdn 规范里有，但是目前没有浏览器支持
drop-shadow(offset-x offset-y blur-radius spread-radius color)

// 下面为我们实际需要用到的 drop-shadow 语法，也就是不需要扩张半径 spread-radius 的写法
drop-shadow(offset-x offset-y blur-radius color)
```

### 第一个 drop-shadow 例子
我们简单举一个例子来看一下 drop-shadow 的实际使用

#### html 部分：

```
<div class="wrap">
    <h2>原始版本</h2>
    <img src="https://img.shenyujie.cc/2018-8-19-icon.png"/>
    <h2>使用模糊半径</h2>
    <img class="after" src="https://img.shenyujie.cc/2018-8-19-icon.png"/>
</div>
```

#### css 部分

```
.after {
    filter: drop-shadow(0 130px 4px red);
    -webkit-filter: drop-shadow(0 130px 4px red);
}
```

实际效果：
<iframe src="https://html.shenyujie.cc/2018-8-30-drop-shadow-1.html" frameborder="0" scrolling="no" width="600px" height="630px"></iframe>

我们使用了 4px 的模糊半径 blur-radius，并且给了生成的阴影，下移了 130px ( offset-y )，那么，继续思考一下，若是我们把模糊半径设置为 0，不就可以得到一个实色的和原来 png 造型一样的阴影了吗，我们用这个阴影去代替原来的 png，就可以达到我们任意改变 png 颜色的目的了, 下面我们看一下不带模糊半径 blur-radius 的 drop-shadow 效果。

### 无 blur-radius 的 drop-shadow 效果
我们只要把 blur-radius 设置为 0 就可以了，如下 css 所示

```
.after {
    filter: drop-shadow(0 130px 0 red);
    -webkit-filter: drop-shadow(0 130px 0 red);
}
```

实际效果：  

<iframe src="https://html.shenyujie.cc/2018-8-30-drop-shadow-2.html" frameborder="0" scrolling="no" width="600px" height="690px"></iframe>  

如此我们便得到了不带模糊半径的红色阴影，下面我们进行最后一步，隐藏原来 png， 使用生成的阴影代替原 png

## 使用 drop-shadow 生成的阴影代替原 png
这里我们需要在 img 标签的外层套一层 div，这样我们改变 img 位置，把它移出容器外，再在容器上设置 `overflow: hidden`，这样就可以隐藏容器，并达到使用 drop-shadow 产生的阴影代替原 png 的效果了

#### html 如下：

```
<div class="wrap">
    <h2>原始版本</h2>
    <img class="before" src="https://img.shenyujie.cc/2018-8-19-icon.png"/>
    <h2>任意改变 png 颜色</h2>
    <div class="imgWrap">
        <img class="after" src="https://img.shenyujie.cc/2018-8-19-icon.png"/>
    </div>
</div>
```

#### css 如下：

```
.after {
    filter: drop-shadow(0 200px 0 red);
    -webkit-filter: drop-shadow(0 200px 0 red);
}

.imgWrap {
    display: inline-block;
    width: 200px;
    height: 200px;
    overflow: hidden;
}

.imgWrap img {
    position: relative;
    top: -200px;
    border-right: 200px solid transparent;
}
```

效果：  

<iframe src="https://html.shenyujie.cc/2018-8-30-drop-shadow-3.html" frameborder="0" scrolling="no" width="600px" height="480px"></iframe>  

我们可以看到，我们已经成功使得原 png 的颜色变成了红色。

## 需要注意的点
1. 当原 png 不可见时，生成的 drop-shadow 阴影也会消失，所以这里使用 `border-right: 200px solid transparent;` 透明边框来做兼容。在新的 chrome 浏览器中就算不用此 hack 方法也可正常显示，但为了兼容性考虑还是加上
2. drop-shadow 替换原 png 颜色的方法在移动端 ios safari 中不可用 （测试机为： ios 11.4），故而此法只推荐在 pc 端使用，需要做移动端的同学请绕路选择其他技术方案

## ios safari 不适用 drop-shadow 方案，无法生效
![](https://img.shenyujie.cc/2018-8-30-drop-shadow-ios.png)