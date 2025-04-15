---
title: 关闭 chrome 浏览器的安全策略 (解决前后端联调时的跨域问题)
date: 2017-07-07 13:49:17
tags: chrome
categories: chrome
comments: true
---
前后端分离实行之后，联调的时候就会出现 ajax 跨域的问题，若是后端没有设置 CORS，或是本地调试没有使用端口转发，那么调试就会极为不方便。这里记录一个 chrome 浏览器下曲线救国的方法。对于 dev 调试来说，最为简洁，那就是关闭 chrome 浏览器本身的同源政策

<!-- more -->

## 测试环境
+ 操作系统： windows 7 64bit service pack 1
+ chrome 版本： 49+

## 方法

1. 在电脑上新建一个目录，例如：C:\userChrome
2. 右键 chrome 快捷方式，点击属性选项卡，切换到快捷方式一栏，在目标输入框里加上 ` --disable-web-security --user-data-dir=C:\userChrome，--user-data-dir` 即可
3. 双击该修改过的 chrome 快捷方式，即可取消 chrome 的同源政策

### 设置 chrome 浏览器的快捷方式
![设置 chrome 快捷方式](//img.shenyujie.cc/2017-7-7-chrome-set.png)
### 取消同源政策
![取消同源政策](//img.shenyujie.cc/2017-7-7-chome-no-cors.PNG)
取消同源政策后 chrome 浏览器会提醒，稳定性和安全性下降，证明成功关闭了同源政策
