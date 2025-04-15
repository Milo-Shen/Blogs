const log4js = require('log4js');
log4js.configure({
    replaceConsole: true,
    appenders: {
        cheese: {
            type: 'dateFile',
            encoding: 'utf-8',
            filename: 'logs/myLog',
            layout: {
                type: "pattern",
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: true,
        },
    },
    categories: {
        default: {appenders: ['cheese'], level: 'debug'},
    }
});

const logger = log4js.getLogger();
logger.info('info');