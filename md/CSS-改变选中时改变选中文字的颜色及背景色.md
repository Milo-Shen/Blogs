---
title: CSS 改变选中时改变选中文字的颜色及背景色
date: 2017-02-09 17:40:10
tags: css
categories: css
comments: true
---
一般情况下，我们选中的网页的文本都是深蓝的底色，白色的字体(windows 下)，黑色的字体（mac os 下），如下所示：  
<!--more--> 
![](//img.shenyujie.cc/2017-2-9-selection-normals.png)
但是我们有的时候会需要对文本选中样式进行修改，以达到统一样式风格的目的，这时候，使用 ::selection 伪类选择器就能做到。  

## ::selection 伪类选择器的兼容性  
![](//img.shenyujie.cc/2017-2-9-selection-compatity.png)
safari(ios 版本) 和 opera mini 浏览器兼容性会有影响以外，其他浏览器的兼容性很乐观。加之选择文本操作在移动端也不常用，兼容性问题基本可以排除  

## :: selection 用法示例  

```
::selection {color: lightgreen;background: lightgray;}
::-moz-selection {color: lightgreen;background: lightgray;}
::-webkit-selection {color: lightgreen;background: lightgray;}
```

最终效果图:  
![](//img.shenyujie.cc/2017-2-9-used-selection.png)
此时我们把选中文字的字体颜色改为了浅绿色，背景改为了浅灰色
