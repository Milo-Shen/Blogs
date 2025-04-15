const log4js = require('log4js');
// 对 category 和 appenders 进行配置
log4js.configure({
    appenders: {
        out: {type: 'stdout'},
        app: {type: 'file', filename: 'application.log'},
        every: {type: 'dateFile', filename: 'every.log'}
    },
    categories: {
        default: {appenders: ['out', 'app'], level: 'debug'},
        cheese: {appenders: ['out', 'every'], level: 'info'}
    }
});

let logger = log4js.getLogger('cheese');
logger.info('hello world');