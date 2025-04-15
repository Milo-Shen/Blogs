let f = function () {
    return new Promise(function (resolve) {
        resolve(x + 2);
    });
};

try {
    // promise 内抛出的异常无法在外部捕获
    f().then(() => {
        console.log('every thing is great !');
    });
} catch (e) {
    // 不执行
    console.log('promise 外部捕获 !')
}