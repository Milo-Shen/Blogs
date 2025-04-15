---
title: log4js 的基本配置
date: 2018-05-25 17:30:00
tags: log4js
categories: nodejs
comments: true

---

前言: 前言：log4js 作为 nodejs 中必不可少的日志处理模块，相比其他的日志模块例如 debug 更有优势。然而官方文档的说明不甚明了，并且随着版本的升级，网上的各种配置方式在新版本中有些也已经废弃，故而重新梳理
<!--more-->
## 测试环境
+ nodeJs  v8.11.2
+ log4Js  v2.5.2

## 日志的作用

1. 显示程序运行状态，收集运行信息
2. 方便定位，排查，解决线上可能出现的问题
3. 结合日志分析软件 ( 譬如 ELK ) 等，对日志进行分析，预警

## 日志等级

![](//img.shenyujie.cc/2018-5-17-log-level.png)

```
  const defaultLevels = {
    ALL: new Level(Number.MIN_VALUE, 'ALL', 'grey'),
    TRACE: new Level(5000, 'TRACE', 'blue'),
    DEBUG: new Level(10000, 'DEBUG', 'cyan'),
    INFO: new Level(20000, 'INFO', 'green'),
    WARN: new Level(30000, 'WARN', 'yellow'),
    ERROR: new Level(40000, 'ERROR', 'red'),
    FATAL: new Level(50000, 'FATAL', 'magenta'),
    MARK: new Level(9007199254740992, 'MARK', 'grey'), // 2^53
    OFF: new Level(Number.MAX_VALUE, 'OFF', 'grey')
  };
```

上述是日志分级的图示，和具体权重代码（ 同时包含了输出日志的颜色 ）。我们可以看到，只有当日志的级别，大于等于当前设定的级别时日志才会被输出。

## 日志分类
除了日志的分级以外，还需要对日志进行分类（ 此时可以结合上述的日志级别共同使用 ），譬如：

+ 访问日志
  1. 对于 http 请求，数据库，磁盘 等 io 访问，可以按照成功与否按照 info 和 error 两个等级再进行细分，以便方便排查，解决问题
  2. 对 io 操作的耗时进行记录，对于大于 500ms 的请求，可以使用 warn 级别进行细分，以便后续优化，改善用户体验
+ 应用日志
  1. 对需要特殊标记的数据进行记录（ 加工过后的数据等 ）
  2. 对程序运行过程中，可能产生的异常（ 非 io 异常 ），进行记录，追踪处理
  3. 记录程序的运行情况，以便分析性能瓶颈，进行优化

### log4js 代码结构 ( category )
![](//img.shenyujie.cc/2018-5-17-category.png)

+ 使用 log4js 时，我们需要传入一个 category 的分类值（若是不传入，会使用默认分类）
+ category 分类下，可以包含多个 appender，每一个 appender 可以单独配置
+ appender 用于决定如何输出日志，并且输出到哪里

### 最简单的 log4js 例子

```
// 第一个 log4js 例子
const log4js = require('log4js');
// 此处没有选择 category，故而使用默认 category
let logger = log4js.getLogger();
// 设置日志的等级，此处为 info
logger.level = 'info';
// 使用相同或更高的等级 (>= info) 可以输出日志
logger.info("hello world");
```

此处，我们获取了 log4js 的实例对象 logger，由于没有明确指定 category 分类，故而使用默认的分类，该分类下的 appender 为 `appenders: { all: { type: 'console' } }`。故而日志默认以 console 的方式打印到控制台

### 明确指定 category 和 appenders 

```
const log4js = require('log4js');
// 对 category 和 appenders 进行配置
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'application.log' }
  },
  categories: {
  	 // getLogger 参数为空时，默认使用该分类
    default: { appenders: [ 'out', 'app' ], level: 'debug' }
  }
});
 
let logger = log4js.getLogger();
logger.info('hello world');
```

上述操作中，我们获取到了默认 category 分类 default，其绑定了两个 appenders，out 和 app，out 会把日志结果输出到标准输入输出流 stdout, app 会把日志输出到文件 application.log。

执行结果：同时在文件 application.log 和 标准输出流 stdout 中，输出：  
<font color="green">[2018-05-20T10:42:12.734] [INFO] default - hello world</font>

### 单个 appender 可以服务于多个 category

![](//img.shenyujie.cc/2018-5-21-appenders.png)

```
const log4js = require('log4js');
// 对 category 和 appenders 进行配置
log4js.configure({
    appenders: {
        out: {type: 'stdout'},
        app: {type: 'file', filename: 'app.log'},
        every: {type: 'dateFile', filename: 'every.log'}
    },
    categories: {
        nice: {appenders: ['out', 'app'], level: 'debug'},
        cheese: {appenders: ['out', 'every'], level: 'info'}
    }
});

let logger = log4js.getLogger('cheese');
logger.info('hello world');
```

上述代码中：有两个 category cheese 和 nice。其中 out appender 同时被两个 category 所共有。上述例子中，当我们初始化 `log4js.getLogger('cheese')` 并写入日志时，日志会根据 out 和 every 两个 appender 同时被写入 stdout 标准输入输出流和 every.log 文件中。

### 总结一下就是 : 
+ appender 决定了日志将会被以指定的方式，写入到指定的目标（流，文件，网络）中去
+ category 可以自由地选择, 组合各个 appenders 来完成我们想要的日志记录功能
+ 同时 category 也定义了当前日志分类的等级 level，来最终决定是否要输出该日志
+ catrgory 是 appenders 的组合体 ( 对于 log4js 2.0 之后的版本，之前版本有另外的配置方式 )

## appenders 的种类与用途 ( 日志落盘 )
如上所述，appenders 决定了日志的写入方式，下面介绍一下，appenders 的种类，和各自的使用方法

![](//img.shenyujie.cc/2018-5-21-appenders-types.png)

日志的分类可以分为： console, stdout, dateFile, file, fileSync, stmp ... 多种，在新版本 2.5.2 中，作者又新增了十余种新的 appenders 分类，具体可以参考该[链接](https://log4js-node.github.io/log4js-node/appenders.html)，此处我们针对最常用的 appenders —— dateFile, file, stdout 的用法做出解析。

### appenders —— dateFile 用法
日志处理中我们常用的 appender 类型就是 dateFile，它会按照指定的时间周期 ( 通常为 1 天 ) 进行日志的分割和管理。生成诸如 `myLog-2018-05-22.log` 的日志 ( ps : 此处是按天划分 )。

### 类型 dateFile 的 appenders 参数配置

+ type : "dateFile"  首先指定 appenders 的类型为 dateFile
+ filename : 用于指定日志落盘的文件地址 ( ps : "logs/myLog.log" )
+ pattern : 用于指定日志切分的时间间隔 
    + ".yyyy-MM" 精确到月
    + ".yyyy-MM-dd" 精确到天
    + ".yyyy-MM-dd-hh" 精确到小时

+ layout : 选择日志输出的格式，该例子中使用 pattern，其余类型会额外总结
+ encoding : 编码格式 （默认 "utf-8"）
+ mode : 默认 0644 无需配置，使用默认即可
+ flags : 默认 "a"，无需配置，使用默认即可
+ compress : compress 为 true，记录当天日志时，会对以往的老日志进行压缩操作，压缩文件后缀为 .gz (默认 : false)
+ alwaysIncludePattern : 当为 true 时，log 文件名会包含之前设置的 pattern 信息 (默认为 false，但是强烈建议开启)
    + alwaysIncludePattern 为 true 时，日志名例如 : myLog.log-2018-05-22
    + alwaysIncludePattern 为 false 时，日志名例如 : myLog.log
+ daysToKeep : 指定日志保留的天数 ( 默认为 0，始终保留 )
+ keepFileExt : 是否保持日志文件后缀名 ( 默认为 false，使用 pattern 的情况下，保持默认就好 )
    + 只有在 alwaysIncludePattern 为 false 时生效

### 具体代码配置

```
const log4js = require('log4js');
log4js.configure({
    replaceConsole: true,
    appenders: {
        cheese: {
            // 设置类型为 dateFile
            type: 'dateFile',
            // 配置文件名为 myLog.log
            filename: 'logs/myLog.log',
            // 指定编码格式为 utf-8
            encoding: 'utf-8',
            // 配置 layout，此处使用自定义模式 pattern
            layout: {
                type: "pattern",
                // 配置模式，下面会有介绍
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            // 日志文件按日期（天）切割
            pattern: "-yyyy-MM-dd",
            // 回滚旧的日志文件时，保证以 .log 结尾 （只有在 alwaysIncludePattern 为 false 生效）
            keepFileExt: true,
            // 输出的日志文件名是都始终包含 pattern 日期结尾
            alwaysIncludePattern: true,
        },
    },
    categories: {
        // 设置默认的 categories
        default: {appenders: ['cheese'], level: 'debug'},
    }
});

const logger = log4js.getLogger();
logger.info('info');
```

执行上述代码后，log4js 会以天为分割，每天生成一个名字如 `myLog.log-2018-05-20` 的日志文件。  
其中记录的信息由自定义的 pattern 构成

```
{"date":"2018-05-22T14:25:04.572","level":"INFO","category":"default","host":"HSH-JV-D-180","pid":"34408","data":'info'}
```

### layout 下 type : pattern 时配置

#### 先看代码：

```
const log4js = require('log4js');
log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                // 用于配置输出的内容信息
                pattern: '%d %p %c %x{user} %m%n',
                // 可省略，用于新增自定义特性
                tokens: {
                    user: function () {
                        return 'jack';
                    }
                }
            }
        }
    },
    categories: {default: {appenders: ['out'], level: 'info'}}
});
const logger = log4js.getLogger();
logger.info('doing something.');
```

#### pattern 配置项解析

1. %r 日志输出时间，以 toLocaleTimeString 函数格式化
2. %p 日志等级
3. %c 日志分类
4. %h 访问计算机的 hostname
5. %m 打印的日志主题内容
6. %n 换行标识
7. %d 日志输出日期 ( 默认以 ISO8601 方式格式化 )
    + 可自定义输出类型 `%d{yyyy/MM/dd-hh.mm.ss}`,输出 `2018/05/22-15.42.18`
8. %z 记录进程 pid 号 ( 数据来自 node 方法 process.pid )
9. %x{<tokenname>} 输出自定义 tokens 中的项目，例如上述例子中的 user
10. %[ 想要输出的内容 %] 用来给被扩起来的内容着色，颜色和日志 level 有关

### appenders —— file 用法
file 虽然没有 dateFile 那么常用，但也是很常见的一种日志落盘方式，下面介绍一下 file 类型 appender 的配置

### 类型 file 的 appenders 参数配置
+ type : "file"  首先指定 appenders 的类型为 file
+ filename : 用于指定日志落盘的文件地址 ( ps : "logs/myLog.log" )
+ layout : 选择日志输出的格式，默认 basic
+ maxLogSize : 单文件最大限制 ( 单位 : bytes )
+ backups : 旧日志最大数量
+ encoding : 编码格式 （默认 "utf-8"）
+ mode : 默认 0644 无需配置，使用默认即可
+ flags : 默认 "a"，无需配置，使用默认即可
+ compress : compress 为 true，记录当天日志时，会对以往的老日志进行压缩操作，压缩文件后缀为 .gz (默认 : false)
+ keepFileExt : 是否保持日志文件后缀名 ( 默认为 false，使用 pattern 的情况下，保持默认就好 )


#### 代码如下:

```
const log4js = require('log4js');
log4js.configure({
    replaceConsole: true,
    appenders: {
        cheese: {
            type: 'file',
            filename: 'logs/fileLog.log',
            layout: {
                type: "pattern",
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            encoding: 'utf-8',
            backups: 5,
            compress: false,
            keepFileExt: true,
        },
    },
    categories: {
        default: {appenders: ['cheese'], level: 'debug'},
    }
});

const logger = log4js.getLogger();
logger.info('info');
```

### appenders —— stdout 用法
该方法用于，输出日志到标注输入输出流，比较简单，配置如下：

```
const log4js = require('log4js');
log4js.configure({
    appenders: { 'out': { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } }
});

const logger = log4js.getLogger();
logger.info('info');
```

如此，控制台内变会打印 `[2018-05-25T16:41:59.738] [INFO] default - info`

<font color="red"> log4js 2.0 版本以上 stdout 作为默认 appender, 推荐使用 stdout 而不是 console 打印控制台日志 </font>
<font color="red"> appender-console 在大量日志输出时会占用 v8 大量内存，拖慢系统性能，不推荐使用 ! </font>

## Layouts 种类与配置

![](//img.shenyujie.cc/2018-5-25-layouts.png)

layout 用来解决如何写入日志，即用来定义日志的格式，layouts 的种类如下

+ Basic : 默认 layout，输出：日志记录时间，等级，分类，日志正文
+ colored : 输出内容和 Basic 相同，但是会根据日志等级，对日志进行着色
+ messagePassThrough : 仅输出日志正文
+ Pattern : 上文已经介绍过，详细配置请看上文

基本上 layout 中需要手动配置的只有 Pattern 一项，配置方式参考上文

## 关于 replaceConsole
replaceConsole 可以将 nodejs 应用中 console.log 输出到控制台的内容，同时也输出到日志文件中，配置方式如下:  

```
const log4js = require('log4js');
log4js.configure({
    // 输出到控制台的内容，同时也输出到日志文件中
    replaceConsole: true,
    appenders: { 'out': { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } }
});

const logger = log4js.getLogger();
logger.info('info');
```

上述配置中，replaceConsole 是和 appenders , categories 在同一层级。
以上就是 log4js 的全部使用，配置方式。后一篇会介绍，如何在 koa2 中使用 log4js 来实际记录我们生产环境中产生的日志。