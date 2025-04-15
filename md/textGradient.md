---
title: CSS3 实现文字渐变色
date: 2017-07-05 15:25:11
tags: css
categories: css
comments: true
---
文字渐变色在 word 文档中非常常见，但是在前端领域，除非使用 svg 或是图片来替代，很难有好的方式去实现文字渐变色。但是在 chrome 和 safari 浏览器中，依托于日益强大的 CSS3 新增特性，我们可以用更加简单的方式去达成这一目标  

<!-- more -->

## 通过 background-clip 和 text-fill-color 实现文字渐变色
代码：  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSS3 文字渐变色</title>
    <style type="text/css" rel="stylesheet">
        h1{
            display: inline-block;
            color: black;
            background:-webkit-linear-gradient(top, pink 50%, orange);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>
<h1>愿你走出半生归来仍是少年</h1>
</body>
</html>
```

效果：  

<iframe src="//html.shenyujie.cc/textGradient_v2.html" width="100%" frameborder="0" scrolling="no"> </iframe>

以上 CSS 代码中，关键的就以下两个部分：  

+ -webkit-background-clip: text
+ -webkit-text-fill-color: transparent


-webkit-text-fill-color 用于：指定文字的填充颜色，这里设置成 transparent 透明色，使得标签`<h1>`的背景色就变成了文字的颜色
-webkit-background-clip 用于：从前景内容的形状（比如文字）作为裁剪区域向外裁剪，这里设置为 text，便可使得`<h1>`标签的背景色只对里面的文字部分起作用  

## background-clip 和 text-fill-color 的兼容性

### background-clip 的兼容性 (支持度不错)
![background-clip 的兼容性](//img.shenyujie.cc/2017-7-5-background-clip.png)

### text-fill-color 的兼容性 (对 IE 和 旧版本 Edge 支持度不佳)
![text-fill-color](//img.shenyujie.cc/2017-7-5-text-fill-color.png)

结合兼容性来看，此种方式还是适合在 chrome 等 webkit 内核的浏览器下使用比较得当，当然了，我们也可以给我们想要显示的字体，手动设置一个默认的颜色，譬如：`color:black`，这样，便做了一个优雅降级，在不支持此属性的浏览器上便会显示黑色字体，在 webkit 内核的浏览器上就能获得我们想要的渐变色效果。

## background-clip 扩展 （实现遮罩效果）

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSS3 文字渐变色</title>
    <style type="text/css" rel="stylesheet">
        @keyframes cartoon{
            0%{background-position:left top;}
            50%{background-position:right top;}
            100%{background-position:left top;}
        }
        @-webkit-keyframes cartoon{
            0%{background-position:left top;}
            50%{background-position:right top;}
            100%{background-position:left top;}
        }
        h1{
            width: 800px;
            background: url(//img.shenyujie.cc/2017-7-5-senior-year.jpg) repeat;
            background-size: auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            -webkit-animation: cartoon 20s linear infinite;
            font-size: 80px;
            font-weight: bold;
        }
    </style>
</head>
<body>
<h1>愿你走出半生归来仍是少年</h1>
</body>
</html>
```

效果：  
<iframe src="//html.shenyujie.cc/textGradient_v4.html" width="100%" frameborder="0" scrolling="no"> </iframe>

我们还可以用图片背景和逐帧动画做出动态的遮罩效果~，其他有趣的玩法等待各位的实现~

## 通过 mask-image 实现文字渐变色
代码：  

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSS3 文字渐变色</title>
    <style type="text/css" rel="stylesheet">
        h1{
            position: relative;
        }
        h1[data-text]::after{
            content: attr(data-text);
            position: absolute;
            left: 0;
            z-index: 2;
            color: blue;
            -webkit-mask-image: -webkit-gradient(linear,0 0,0 bottom,from(red),to(transparent));
        }
    </style>
</head>
<body>
<h1 data-text="愿你走出半生归来仍是少年"></h1>
</body>
</html>
```

效果：  

<iframe src="//html.shenyujie.cc/textGradient_v3.html" width="100%" frameborder="0" scrolling="no"> </iframe>

以上 CSS 代码中，关键的就以下两个部分：  

+ content: attr(data-text)
+ -webkit-mask-image 

在伪元素 after 中，使用 attr 在页面元素中动态获取内容，所以此处`h1`标签内部可以省略需要显示的文字， 
然后再借助 -webkit-mask-image 属性模拟出渐变色的效果，即可达到目的，不过此方法与第一种方法相比，局限性很大，这种局限性最主要是由于`-webkit-mask-image`属性造成的。  

1. 关于 -webkit-mask-image  功能 ： 可以赋值一张带透明部分的图片或是带透明部分的渐变色背景，被透明部分遮住的部分将不被显示，被不透明部分遮住的部分将显示。显示的是背景图片或者背景色。
2. 借助 -webkit-mask-image 的这个特性，我们传入了一张线性渐变色背景，这个背景从红色慢慢过渡到透明色，那么此时红色部分遮盖的字体将被显示，而透明色部分遮盖的字体将不被显示。我们的文字设置的是 color: blue ，那么效果就会是字体颜色从蓝色(此时 mask-image 为 red, 不透明, 故字体颜色 blue 可被显示) 慢慢变化到透明色 (此时 mask-image 为 transparent, 透明, 故字体颜色 blue 不可被显示)
3. 以上特性，便决定了，mask-image 背景颜色的取值可以是不透明任意色，但是颜色的种类只能是 color 设置的颜色，只不过透明度上面会有所区分（只能实现单一颜色的过渡），不像第一种方法，可以实现多种颜色之间的过渡

### -webkit-mask-image 属性的兼容性 (兼容性堪忧，加上实现的效果单一，不推荐使用此法)
![-webkit-mask-image 属性的兼容性](//img.shenyujie.cc/2017-7-5-mask-image.png)
