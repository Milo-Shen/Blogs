---
title: CSS 实现元素垂直居中
date: 2017-02-22 11:15:38
tags: css
categories: css 布局
comments: true
---
44 年前人类就已经登上了月球，但现在我们仍然无法在 CSS 中实现垂直居中。  
<!--more--> 
 在 CSS 中实现一个元素的水平居中很简单:  
> 若是一个行内元素，就对它的父级 text-align: center 即可
> 若是一个块级元素，就对它本身 margin : auto 即可  

然而如果要对一个元素进行垂直居中，就没有简单的方式可以使用，对于尺寸不固定的元素来说尤甚  
## 固定尺寸元素的解决方式
首先给出我们的初始布局例子:  
!['初始布局'](//img.shenyujie.cc/2017-2-10-vertial-origin.png)
下面给出灰色区块 div 的 css 样式:  

```
main {
    display: inline-block;
    width: 350px;
    height: 150px;
    background: gray;
    color: white;
    text-align: center;
    box-sizing: border-box;
    padding-top: 35px;
}
```

此处灰色区块 div 的宽度是 350px，高度是 150px，我们对该 DIV 进行垂直居中操作  

### 基于绝对定位的解决方案
思路：我们可以把元素本身进行绝对定位，然后把 left 和 top  的值都设置成 50%，把元素的左上角放置在视口（或最近的、具有定位元素的祖先元素）中心，再利用负外边距，将它向左，向上移动（移动距离等于其自身宽高的一半），从而把元素的正中心放置在视口的正中心。   
#### 方法 1 ( 元素有确定宽高 )：
代码如下：  

```
main {
    position: absolute;
    left: 50%;
    top:50%;
    margin-top: -75px;
    margin-left: -175px;
}
```

借助 calc() 函数，我们还能把 css 简写成:  

```
main {
    position: absolute;
    left: calc(50% - 175px);
    top:calc(50% - 75px);
}
```

效果图如下：  
![](//img.shenyujie.cc/2017-2-14-type1-used.png)
缺陷：此方法需要知道元素的宽高，但是在实际的应用场景中，其尺寸往往是由其内容决定的，此方法的应用场景就大大受到了限制  
#### 方法2 ( 元素没有固定宽高 )
对于没有固定宽高的元素，CSS 中的 translate 变形属性使用百分比时，它是按照自身的宽高为基准进行换算和移动的，正好符合我们的需要，代码如下：  

```
main {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

效果如下:  
![](//img.shenyujie.cc/2017-2-20-type1-2.png)
如此，便可让不定宽高的元素实现垂直居中

### 基于视口单位的解决方案
假如我们不使用绝对定位，仍然可以采用 transform 的技巧达到我们的效果，但是在缺少 left 和 top 属性的情况下，我们如何把元素移动到容器的正中心呢？  
也许我们第一反应会使用 margin 的百分比来解决，代码如下：  

```
main {
    top: 50%;
    margin: 50% auto 0;
    transform: translateY(-50%);
}
```

结果：  
![](//img.shenyujie.cc/2017-2-20-type-2-1.png)
结果出乎我们的预料，原因在于，margin 的百分比值是以其父元素的宽度作为解析基准的，无论是 margin-top、margin-bottom、margin-left 或是 margin-right 都一样。不过要是我们只是想让一个元素垂直居中，还是有路可走的。 CSS 定义了一套与视口相关的长度单位 vh 和 vw  。

vh 的定义：
相对于视口的高度，视口被均分为 100 单位的 vh  
<i>1 vh 代表了 1% 的视口高度</i>
视口指的是浏览器的可视区部分（innerWidth 和 innerHeight 的范围），不包含浏览器的导航栏和标签栏之类。  

vw 的定义：
相对于视口的宽度，视口被均分为 100 单位的 vw  
<i>1 vw 代表了 1% 的视宽高度</i>  

vh 的兼容性：
![](//img.shenyujie.cc/2017-2-20-vhs.png)

vw 的兼容性：
![](//img.shenyujie.cc/2017-2-20-vws.png)

可见移动端基本都支持，兼容性方面并不需要过多的担心，唯一例外的就是 uc 浏览器，全系列不支持，若是需要兼容 uc mobile 需要慎重考虑，代码如下：  

```
main {
    top: 50%;
    margin: 50vh auto 0;
    transform: translateY(-50%);
}
```

效果如下：
![](//img.shenyujie.cc/2017-2-20-type1-3.png)
### 基于 Flexbox 的解决方案
伸缩盒模型 flexbox 是解决此类问题最理想的方式，它就是为此而设计的，之前的浏览器由于兼容性问题，这种方式不是很推荐，但目前该特性的支持度已经不需要太过担心，以下是兼容性列表：  
![](//img.shenyujie.cc/2017-2-20-flex.png)
可见 IE9 以上都支持。  
<b>实现代码如下( 1 )</b>：  
父级：  

```
body {
    display: flex;
    background-color: orange;
    text-align: center;
    min-height: 100vh;
}
```

子级：  

```
main {
    margin: auto;
}
```

此处需要注意的是：  
1. 父级需要指定高度，这里设置成了 100vh, 也就是整个视口的高度
2. 子级的 margin: auto 不仅在垂直方向上让元素垂直居中，在水平方向上也一样

<b>实现代码如下( 2 )</b>：  
父级：  

```
body {
    display: flex;
    background-color: orange;
    text-align: center;
    min-height: 100vh;
    align-items : center;
    justify-content: center;
}
```

效果如下：  
![](//img.shenyujie.cc/2017-2-20-flexbox.png)

> justify-content 用于设置主轴 (横轴) 上的对齐方式
> align-items 用于设置侧轴（纵轴）上的对其方式

### 表格布局法实现垂直居中
表格中的内容只要设置了 vertical-align: middle 时，内容便会垂直居中，只是这种方式局限性大， hack 的味道过重，代码如下：  

html 结构：  

```
<div class="wrapper">
    <div class="content">
        需要垂直居中的元素
    </div>
</div>
```

父级 CSS：  

```
.wrapper {
    display: table;
    width: 100%;
    height: 100%;
    background-color: orange;
}
```

子级 CSS：  

```
.content {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
}
```

效果：  
![](//img.shenyujie.cc/2017-2-21-tablecell.png)

这里为了方便演示，把父级的高度设置成了 100%，实际生产场景中按照需要设置即可，这里面用 display:table 代替 table 标签，方便大家按照习惯来书写。  

### 行内块法实现垂直居中
我们可以使用一个伪元素，用于撑开容器的高度，实现垂直居中。  
html 结构：  

```
<div class="block" style="height: 600px;">
    <div class="centered">
        <h1>Some text</h1>
        <p>我们的纪念</p>
    </div>
</div>
```

css 代码：  

```
.block {
    text-align: center;
    background: #c0c0c0;
    border: #a0a0a0 solid 1px;
    margin: 20px;
}

.block:before {
    content: '\200B';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
}

.centered {
    display: inline-block;
    vertical-align: middle;
    width: 300px;
    padding: 10px 15px;
    border: #a0a0a0 solid 1px;
    background: #f5f5f5;
}
```

效果：  
![](//img.shenyujie.cc/2017-2-21-before.png)

此处我们可以定一个 inline-block 类型的伪元素，然后让它的高度设置为 100%，并且让它按照中线居中，即可让内部同为 inline-block 的元素垂直居中。此方法只适用于 inline-block 元素，局限性较大。  

### 基于自适应绝对定位的解决方法
之前介绍的绝对定位法，无论元素是否具有固定的宽高，我们都会想办法把元素左上角拉到视口的中心，现在介绍一种不需要把把元素拉到视口中心的方法  

html 结构：  

```
<div class="wrapper">
    <div class="subElement">
        垂直居中
    </div>
</div>
```

CSS：  

```
.wrapper {
    width: 100%;
    height: 100%;
    background-color: lightgoldenrodyellow;

}
.subElement {
    color: white;
    font-size: 50px;
    line-height: 150px;
    text-align: center;
    width: 300px;
    height: 150px;
    background: darkgray;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    margin: auto;
}
```

步骤：  
1. 给子级元素设置绝对定位 position: absolute
2. 子级设置 margin: auto
3. 子级设置 top: 0; right: 0; bottom: 0; left: 0

效果图：  
![](//img.shenyujie.cc/2017-2-21-position.png)
如此便实现了垂直居中


