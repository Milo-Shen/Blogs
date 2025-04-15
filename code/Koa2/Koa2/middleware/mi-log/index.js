const logger = require("./log4js_5");

/**
 * 中间件错误处理
 * @param options
 * @returns {function(*=, *=): *}
 */
module.exports = (options) => {

  const loggerMiddleware = logger(options);

  return (ctx, next) => {
    return loggerMiddleware(ctx, next)
    .catch((e) => {
        if (ctx.status < 500) {
            ctx.status = 500;
        }
        ctx.log.error(e.stack);
        ctx.throw(e);
    });
  };
};