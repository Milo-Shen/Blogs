const log4js = require('log4js');
log4js.configure({
    replaceConsole: true,
    appenders: {
        console: {type: "console"},
        cheese: {
            category: "cheese",
            type: "dateFile",
            layout: {
                type: "pattern",
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
            },
            filename: '/logs/firstConfig',
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd"
        }
    }
});

let logger = log4js.getLogger('console');
logger.trace('trace');