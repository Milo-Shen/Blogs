const log4js = require('log4js');
log4js.configure({
    "appenders": [{
        "category": "console",
        "type": "console"
    }, {
        "category": "info",
        "type": "dateFile",
        "layout": {
            "type": "pattern",
            "pattern": '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
        },
        "filename": path.join(process.env.LOGDIR, "/info/info"),
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
    }, {
        "category": "error",
        "type": "dateFile",
        "layout": {
            "type": "pattern",
            "pattern": '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
        },
        "filename": path.join(process.env.LOGDIR, "/error/error"),
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
    }, {
        "category": "error_http",
        "type": "dateFile",
        "layout": {
            "type": "pattern",
            "pattern": '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
        },
        "filename": path.join(process.env.LOGDIR, "/error/error_http"),
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
    }, {
        "category": "http",
        "type": "dateFile",
        "layout": {
            "type": "pattern",
            "pattern": '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
        },
        "filename": path.join(process.env.LOGDIR, "/http/http"),
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd.log"
    }],
    "replaceConsole": true,
    "levels": {
        "all": "auto"
    }
});

log4js.configure({
    replaceConsole: true,
    appenders: {
        cheese: {type: 'file', filename: 'cheese.log'},
        another: {type: 'file', filename: 'another.log'},
        stdout: {type: 'stdout'}
    },
    categories: {
        default: {appenders: ['stdout'], level: 'debug'}
    }
});

const logger = log4js.getLogger();
logger.trace('trace');
logger.debug('debug');
logger.info('info');
logger.warn('warn');
logger.error('error');
logger.fatal('fatal');