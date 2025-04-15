const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("Time:", new Date());