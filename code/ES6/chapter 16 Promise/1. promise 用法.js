// promise 函数的定义
let promise = new Promise(function (resolve, reject) {
    if (/* 异步操作成功*/) resolve(value);
    else reject(error);
});

// promise 函数的使用
promise.then(function (value) {
    // success
}, function (value) {
    // failure
});