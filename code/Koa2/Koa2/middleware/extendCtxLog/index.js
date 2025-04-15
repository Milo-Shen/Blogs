module.exports = () => {
    return async (ctx, next) => {
        ctx.log.info('extendCtx middleware');
        throw new Error('error');
        await next();
    }
};