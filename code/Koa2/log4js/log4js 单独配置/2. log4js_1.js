// 第一个 log4js 例子
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("Some debug messages");

