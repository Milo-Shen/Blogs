const log4js = require('log4js');
log4js.configure({
    replaceConsole: true,
    appenders: {
        cheese: {
            type: 'file',
            filename: 'logs/cheese.log',
            layout: {
                type: "pattern",
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd.log",
        },
        another: {
            type: 'file',
            filename: 'logs/another.log',
            layout: {
                type: "pattern",
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd.log",
        },
        stdout: {type: 'stdout'},
    },
    categories: {
        default: {appenders: ['stdout', 'cheese', 'another'], level: 'debug'},
        // xxx: {appenders: ['stdout'], level: 'debug'}
    }
});

const logger = log4js.getLogger();
logger.trace('trace');
logger.debug('debug');
logger.info('info');
logger.warn('warn');
logger.error('error');
logger.fatal('fatal');

log4js.shutdown(() => console.log(56));