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