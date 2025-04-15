const log4js = require('log4js');
const methods = ["trace", "debug", "info", "warn", "error", "fatal", "mark"];

module.exports = () => {
    const contextLogger = {};
    log4js.configure({
        appenders: {
            console: {type: 'stdout'},
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
        categories: {default: {appenders: ['cheese','console'], level: 'info'}}
    });

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

        // 为 ctx 增加 log 方法
        Object.defineProperty(ctx, 'log', {
            value: contextLogger,
            writable: false,
            enumerable: true,
            configurable: false
        });

        await next();
        // 记录完成的时间 作差 计算响应时间
        const responseTime = Date.now() - start;
        ctx.log.info(`响应时间为${responseTime / 1000}s`);
    }
};