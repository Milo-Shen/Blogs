---
title: webkit 下触发重绘的方式  -webkit-transform:translateZ(0) 
date: 2017-08-25 17:34:00
tags: css
categories: css
comments: true

---

最近制作的网页需要嵌套在 webview 中，发现有的页面 dom 结构改变后，页面并没有重新进行渲染，IE 下有类似 zoom:1 的方式去强制触发 haslayout 重绘，但 webkit 下不适用。这里记录一个 webkit 下触发页面重绘的方式 ： -webkit-transform:translateZ(0) 。若是遇到页面不重绘的问题，都可以试试这个方法