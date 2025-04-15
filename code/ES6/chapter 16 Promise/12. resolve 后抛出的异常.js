let promise = new Promise(resolve => {
    resolve('ok');
    setTimeout(() => {
        throw new Error('error')
    }, 0);
});

promise.then(
    success => console.log(success),
    error => console.log(error)
);

process.on('uncaughtException', function (err) {
    // 此处使用此全局函数作为异常处理
    console.log(err.stack)
});
