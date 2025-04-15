let f = function () {
    return new Promise(resolve => {
        resolve(x / 2);
    });
};

f().catch(err => console.log(err))
    .then(() => {
        // 输出: continue
        console.log('continue')
    });