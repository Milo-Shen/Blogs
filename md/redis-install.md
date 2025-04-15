---
title: Ubuntu 编译安装 Redis (转)
date: 2018-05-17 16:32:00
tags: redis
categories: redis
comments: true

---

前言:  虽然我们可以通过，类似 yum, apt-get 等包管理工具安装 redis，但是仍有一些弊端，这一篇我们介绍一下，如何通过编译源码的方式来安装 redis（本文非原创，转自 https://fqk.io/redis-installation，非特意标注的皆为原创）

<!--more-->

## 包管理工具安装 redis 的劣势
+ 不同的包管理工具，安装的规则不同，譬如，安装路径，默认配置等
+ 包管理工具只会安装基础的功能，不方便进行功能扩展（譬如安装第三方模块）
+ 包管理工具自带的版本通常比较比官网滞后，无法安装最新版本

## 源码安装 redis

```
## 下载并编译
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make

## Redis 的核心文件就这两个
sudo cp src/redis-server /usr/local/bin/
sudo cp src/redis-cli /usr/local/bin/

## 此目录用于保存各端口配置文件
sudo mkdir /etc/redis

## 此目录用于保存各端口的持久化数据文件
sudo mkdir /var/redis

## 端口6379的配置文件
sudo cp redis.conf /etc/redis/6379.conf

## 端口6379的持久化目录
sudo mkdir /var/redis/6379
```

## 配置 redis

```
## 编辑配置文件
sudo vi /etc/redis/6379.conf

#### 修改以下字段 ####
daemonize => yes
pidfile => /var/run/redis_6379.pid
port => 6379
logfile => /var/log/redis_6379.log
dir => /var/redis/6379

#### 考虑安全性，添加以下记录 ####
bind 127.0.0.1
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command EVAL ""
```

## 启动脚本

### 编写启动脚本

```
echo '#!/bin/sh
### BEGIN INIT INFO
# Provides:             redis_6379
# Required-Start:       $syslog $remote_fs
# Required-Stop:        $syslog $remote_fs
# Should-Start:         $local_fs
# Should-Stop:          $local_fs
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    redis_6379 - Persistent key-value db
# Description:          redis_6379 - Persistent key-value db
### END INIT INFO

REDISPORT=6379
EXEC=/usr/local/bin/redis-server
CLIEXEC=/usr/local/bin/redis-cli

PIDFILE=/var/run/redis_${REDISPORT}.pid
CONF="/etc/redis/${REDISPORT}.conf"
' > ./redis_6379

cat utils/redis_init_script.tpl >> ./redis_6379
sudo chmod +x ./redis_6379
```

### 部署启动脚本

```
## For Linux
sudo cp ./redis_6379 /etc/init.d/

## For OS X，因为没有 init.d 目录，故放在 /etc/redis 下
sudo cp ./redis_6379 /etc/redis/redis_6379
```

## Linux

### 开机启动

```
## For CentOS
echo "/etc/init.d/redis_6379 start" | sudo tee --append /etc/rc.d/rc.local

## For Ubuntu
sudo update-rc.d redis_6379 defaults
```

### 运行和停止

```
## 启动 redis_6379
sudo /etc/init.d/redis_6379 start 

## 停止 redis_6379
sudo /etc/init.d/redis_6379 stop
```

## OS X

### 开机启动

```
sudo vi /Library/LaunchDaemons/io.redis.6379.plist
```

### 内容

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>Label</key>
        <string>io.redis.6379</string>
        <key>ProgramArguments</key>
        <array>
                <string>/etc/redis/redis_6379</string>
                <string>start</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
</dict>
</plist>
```

### 启动项

```
## 添加启动项
sudo launchctl load -w /Library/LaunchDaemons/io.redis.6379.plist

## 删除启动项
sudo launchctl unload -w /Library/LaunchDaemons/io.redis.6379.plist
```

### 运行和停止

```
## 启动 redis_6379
sudo /etc/redis/redis_6379 start 

## 停止 redis_6379
sudo /etc/redis/redis_6379 stop
```
