---
title: CSS 零碎知识点初步整理
date: 2016-07-18 10:07:27
tags: css 
categories: css
comments: true

---
7月18日，周一晴，天朗气清，惠风和畅。做前端工作也快将近一年了，平素里积累了一些但是却又不够系统，也许是笔记做的少了些许。清晨，乘着心情尚好，略微整理一下，以慰去年的遗憾
<!--more-->
1. 对WEB标准以及W3C的理解与认识
	+ 标签闭合、标签小写、不乱嵌套、提高搜索机器人搜索几率
	+ 使用外链css和js脚本、结构行为表现的分离、文件下载与页面速度更快
	+ 内容能被更多的用户所访问、内容能被更广泛的设备所访问、更少的代码和组件
	+ 提供打印版本而不需要复制内容、提高网站易用性
2. xhtml和html有什么区别  
	+ HTML是一种基本的WEB网页设计语言，XHTML是一个基于XML的置标语言
	+ XHTML 元素必须被正确地嵌套
	+ XHTML 元素必须被关闭
	+ XHTML 标签名必须用小写字母
	+ XHTML 文档必须拥有根元素
3. Doctype? 严格模式与混杂模式-如何触发这两种模式，区分它们有何意义
	+ 用于声明文档使用那种规范（html/Xhtml）一般为 ：严格 、过度、基于框架的html文档
	+ 加入XMl声明可触发，解析方式更改为IE5.5拥有IE5.5的bug
4. 行内元素有哪些？块级元素有哪些？CSS的盒模型？
	+ 块级元素：div p h1 h2 h3 h4 form ul 
	+ 行内元素：a b br i span input select 
	+ CSS盒模型：内容，border,margin，padding
5. CSS引入的方式有哪些? link和@import的区别是?  
	+ 引入方式：内联、内嵌、外链、导入
	+ link和@import区别 ：
		+ 同时加载
		+ 前者无兼容性，后者CSS2.1以下浏览器不支持
		+ Link支持使用javascript改变样式，后者不可
6. CSS选择符有哪些？哪些属性可以继承？优先级算法如何计算？内联和important哪个优先级高？
	+ 选择符：标签选择符、类选择符、id选择符
	+ 继承不如指定 Id > class > 标签选择
	+ 内联和important优先级哪个高：important优先级高
7. 写出几种IE6 BUG的解决方法  
	+ 双边距BUG：float引起的，可以使用display
	+ 像素问题：使用float引起的，使用dislpay:inline -3px;
	+ 超链接hover点击后失效：使用正确的书写顺序 linkvisited hover activen 
	+ IE z-index问题：给父级添加position:relative
	+ PNG 透明：使用js代码改
	+ min-height 最小高度 !important 解决
	+ select 在ie6下遮盖：使用iframe嵌套
	+ 为什么没有办法定义1px左右的宽度容器(IE6默认的行高造成的，使用over:hidden,zoom:0.08line-height:1px)
8. 描述css reset的作用和用途
	+ css reset的作用：Reset重置浏览器的css默认属性
	+ 用途：浏览器的品种不同，样式不同，然后重置，让他们统一
9. 浏览器标准模式和怪异模式之间的区别是什么
	+ 盒子模型 渲染模式的不同
	+ 使用window.top.document.compatMode 可显示为什么模式
10. 你如何对网站的文件和资源进行优化？期待的解决方案包括:
	+ 文件合并
	+ 文件最小化/文件压缩
	+ 使用CDN托管
	+ 缓存的使用
11. 解决浏览器下标签之间空隐藏的空白字符问题
	+ font-size : 0
