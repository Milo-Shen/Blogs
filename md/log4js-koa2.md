---
title: koa2 集成 log4js
date: 2018-05-29 16:32:00
tags: log4js
categories: nodejs
comments: true

---

前言：之前介绍了 log4js 的基本配置，这一章，我们尝试让其与 koa2 框架相结合，真正在实际的项目中发挥效用
<!--more-->

## 环境准备
+ nodeJs : 8.11.1
+ koa2 : 2.4.1

## 编写 logger 中间件
### 创建 /logger/mylog.js 文件，并增加如下代码：

```
const log4js = require('log4js');
module.exports = options => {
    return async (ctx, next) => {
        const start = Date.now();
        log4js.configure({
            appenders: {
                cheese: {
                    type: 'dateFile',
                    encoding: 'utf-8',
                    filename: 'logs/myLog',
                    layout: {
                        type: "pattern",
                        pattern: '{"date":"%d","level":"%p","data":\'%m\'}'
                    },
                    pattern: "-yyyy-MM-dd.log",
                    alwaysIncludePattern: true,
                },
            },
            categories: {default: {appenders: ['cheese'], level: 'info'}}
        });
        const logger = log4js.getLogger('cheese');
        await next();
        const end = Date.now();
        const responseTime = end - start;
        logger.info(`响应时间为: ${(responseTime / 1000).toFixed(4)}s，请求 url : ${ctx.request.url}`);
    }
};
```

### 修改 app.js，将 logger 中间件挂载到 koa2 上去

```
// 引入 logger 中间件
const logger = require('./logger/mylog');
// 挂载到 koa2 上去
app.use(logger());
```

### 访问页面，日志输出结果

```
{"date":"2018-05-28T14:52:27.661","level":"INFO","data":'响应时间为: 0.0070s，请求 url : /'}
{"date":"2018-05-28T14:52:27.686","level":"INFO","data":'响应时间为: 0.0030s，请求 url : /home/main.css'}
```

上述例子中，当 http 请求经过此中间件时便会在 `myLog.log` 文件中记录一条 level 为 info 级别的日志文件，并且记录下请求的响应时间。

### 将 logger 绑定到 ctx 上，方便访问

```
const log4js = require('log4js');
const methods = ["trace", "debug", "info", "warn", "error", "fatal", "mark"];

module.exports = () => {
    const contextLogger = {};
    log4js.configure({
        appenders: {
            cheese: {
                type: 'dateFile',
                encoding: 'utf-8',
                filename: 'logs/myLog',
                layout: {
                    type: "pattern",
                    pattern: '{"date":"%d","level":"%p","data":\'%m\'}'
                },
                pattern: "-yyyy-MM-dd.log",
                alwaysIncludePattern: true,
            },
        },
        categories: {default: {appenders: ['cheese'], level: 'info'}}
    });
    // 获取默认 log4js category
    const logger = log4js.getLogger('cheese');

    return async (ctx, next) => {
        // 记录请求开始的时间
        const start = Date.now();
        // 循环 methods 将所有方法挂载到ctx 上
        methods.forEach(method => {
            contextLogger[method] = (message) => {
                logger[method](message)
            }
        });

        // 为 ctx 增加 log 方法，并且指定 log 属性不可删除或修改
        // 防止后续错误修改 ctx 属性
        Object.defineProperty(ctx, 'log', {
            value: contextLogger,
            writable: false,
            enumerable: true,
            configurable : false
        });

        await next();
        // 记录完成的时间 作差 计算响应时间
        const responseTime = Date.now() - start;
        ctx.log.info(`响应时间为${responseTime / 1000}s`);
    }
};
```

### 其他中间件通过 ctx 上的 log 方法打印日志

创建 middleware/extendCtxLog 文件，并输入：

```
module.exports = () => {
    return async (ctx, next) => {
        ctx.log.info('extendCtx middleware');
        await next();
    }
};
```

app.js 中应用该中间件

```
const extendCtxLog = require('./middleware/extendCtxLog');
app.use(extendCtxLog());
```

重启 node 服务，并访问，log 日志输出：

```
{"date":"2018-05-29T10:53:47.288","level":"INFO","data":'extendCtx middleware'}
{"date":"2018-05-29T10:53:47.331","level":"INFO","data":'响应时间为0.044s'}
```

这样，其他的中间件也可以访问到 ctx 上的 log 日志服务了。

###  将 logger 绑定到 global 对象
上述的 logger 中间件存在一个问题，那就是每一次 http 请求经过该中间件，都会重新进行 `getLogger 操作`，故而不妨把 logger 对象绑定到 global 上去，logger 中间件去调用 global 上的 logger 实例来进行日志操作

创建 /logger/global.js 文件

```
const log4js = require('log4js');
const methods = ["trace", "debug", "info", "warn", "error", "fatal", "mark"];
const contextLogger = {};
log4js.configure({
    appenders: {
        console: {
            type: 'stdout',
        },
        cheese: {
            type: 'dateFile',
            encoding: 'utf-8',
            filename: 'logs/globalLog',
            layout: {
                type: "pattern",
                pattern: '{"date":"%d","level":"%p","data":\'%m\'}'
            },
            pattern: "-yyyy-MM-dd.log",
            alwaysIncludePattern: true,
        },
    },
    categories: {default: {appenders: ['cheese','console'], level: 'info'}}
});

module.exports = function () {

    const logger = log4js.getLogger('cheese');
    // 循环 methods 将所有方法挂载到ctx 上
    methods.forEach(method => {
        contextLogger[method] = (message) => {
            logger[method](message)
        }
    });
    // 为 ctx 增加 log 方法
    Object.defineProperty(global, 'log', {
        value: contextLogger,
        writable: false,
        enumerable: true,
        configurable: false
    });

};
```

改写 app.js，初始化 globalLogger 实例

```
// 初始化 logger 实例
const globalLogger = require('./middleware/mi-log/global');
globalLogger();
```

改写 logger 中间件

```
module.exports = () => {
    return async (ctx, next) => {
        // 记录请求开始的时间
        const start = Date.now();
        await next();
        // 记录完成的时间 作差 计算响应时间
        const responseTime = Date.now() - start;
        global.log.info(`响应时间为${responseTime / 1000}s`);
    }
};
```

重启 node 并访问，系统会新建 globalLog.log 文件并输出：

```
{"date":"2018-05-29T10:31:14.531","level":"INFO","data":'响应时间为0.031s'}
{"date":"2018-05-29T10:31:14.609","level":"INFO","data":'响应时间为0.005s'}
```

## 抽取 log4js 配置，并且增加日志记录信息

修改 /logger/mylog.js 文件 : 

```
const log4js = require('log4js');
const methods = ["trace", "debug", "info", "warn", "error", "fatal", "mark"];

// 提取默认公用参数对象
const baseInfo = {
    appLogLevel: 'debug',         // 指定记录的日志级别
    dir: 'logs',		          // 指定日志存放的目录名
    env: 'dev',                   // 指定当前环境，当为开发环境时，在控制台也输出，方便调试
    projectName: 'koa2-tutorial', // 项目名，记录在日志中的项目信息
    serverIp: '0.0.0.0'		      // 默认情况下服务器 ip 地址
};

module.exports = options => {
    const contextLogger = {};
    const appenders = {};

    const opts = Object.assign({}, baseInfo, options || {});

    // 需要的变量解构 方便使用
    const {env, appLogLevel, dir, serverIp, projectName} = opts;

    appenders.cheese = {
        type: 'dateFile',
        filename: `${dir}/task`,
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true
    };

    // 环境变量为dev local development 认为是开发环境
    if (env === "dev" || env === "local" || env === "development") {
        appenders.out = {
            type: "console"
        }
    }
    let config = {
        appenders,
        categories: {
            default: {
                appenders: Object.keys(appenders),
                level: appLogLevel
            }
        }
    };

    const logger = log4js.getLogger('cheese');

    return async (ctx, next) => {
        const start = Date.now();

        // 丰富日志信息
        const {method, url, host, headers} = ctx.request;
        let client = {
            method,
            url,
            host,
            serverIp,
            projectName,
            referer: headers['referer'],
            userAgent: headers['user-agent'],
        };

        client = JSON.stringify(client);

        // 配置 log4js
        log4js.configure(config);
        methods.forEach(method => {
            contextLogger[method] = (message) => {
                logger[method](message)
            }
        });

        // 为 ctx 增加 log 方法
        Object.defineProperty(ctx, 'log', {
            value: contextLogger,
            writable: false,
            enumerable: true,
            configurable: false
        });

        await next();
        // 检测响应时间
        const responseTime = Date.now() - start;
        logger.info(`响应时间为${responseTime / 1000}s, 请求相关信息: ${client}`);
    }
};
```

修改 app.js : 

```
const ip = require("ip");
app.use(logger({
    env: 'dev',
    projectName: 'koa2&log4js',
    appLogLevel: 'info',
    dir: 'logs',
    serverIp: ip.address()
}));
```

日志输出结果 : 

```
[2018-05-29T14:57:29.836] [INFO] cheese - 响应时间为0.072s, 请求相关信息: {"method":"GET","url":"/","host":"localhost:3000","serverIp":"192.168.105.165","projectName":"koa2&log4js","userAgent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"}
[2018-05-29T14:57:29.873] [INFO] cheese - 响应时间为0.004s, 请求相关信息: {"method":"GET","url":"/home/main.css","host":"localhost:3000","serverIp":"192.168.105.165","projectName":"koa2&log4js","referer":"http://localhost:3000/","userAgent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"}
```

## 记录 node 错误信息

我们新增 /logger/index.js 文件，并输入如下内容：

```
const logger = require("./logger/");

/**
 * 中间件错误处理
 * @param options
 */
module.exports = (options) => {

  const loggerMiddleware = logger(options);

  return (ctx, next) => {
    return loggerMiddleware(ctx, next)
    .catch((e) => {
        if (ctx.status < 500) {
            ctx.status = 500;
        }
        ctx.log.error(e.stack);
        ctx.throw(e);
    });
  };
};
```

如此便能捕获，其他中间件中抛出的异常，并且记录到日志里去。这里面，状态吗小于 500 的都按照 500 来处理。