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