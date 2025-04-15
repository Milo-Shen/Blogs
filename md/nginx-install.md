---
title: Ubuntu 编译安装 nginx
date: 2018-05-16 14:45:00
tags: nginx
categories: nginx
comments: true

---

前言：nginx 作为一个高性能的HTTP和反向代理服务器，在生产环境中应用甚广。本文介绍一下，在 ubuntu 环境下，如何通过源码编译安装 nginx (可定制性更高，也可以扩展第三方模块)
<!-- more -->

## 下载源码
可以去 [nginx 官方网站](http://nginx.org/en/download.html) 获取最新的源码包，截止到 2018-5-16 日，最新 stable 版本为 1.14.0
![](//html.shenyujie.cc/2018-5-16-nginx-website.png)

## 安装

```
## Ubuntu 安装依赖库
sudo apt-get install libpcre3 libpcre3-dev libpcrecpp0 libssl-dev zlib1g-dev 

## 通过 wget 下载源码
wget http://nginx.org/download/nginx-1.14.0.tar.gz
tar -zxvf nginx-1.14.0.tar.gz
cd nginx-1.14.0

## 指定安装路径为 /usr/local/nginx
./configure --prefix=/usr/local/nginx

## 如果需要安装第三方模块，可在 configure 阶段通过 --add-module 参数指定模块路径（可以略过）
./configure --prefix=/usr/local/nginx \
    --add-module=/path/to/some-module

## 编译
make

# 安装
make install

## 建软连接
ln -s /usr/local/nginx/sbin/nginx /usr/local/bin/
```

## 常用操作

```
## 检查配置是否正确
sudo nginx -t

## 启动服务
sudo nginx

## 强制停止服务
sudo nginx -s stop

## 正常处理完当前所有请求再停止服务
sudo nginx -s quit

## 使 nginx 应用新的配置
sudo nginx -s reload
```

## 命令行工具
[可以查看官网](http://nginx.org/en/docs/switches.html)