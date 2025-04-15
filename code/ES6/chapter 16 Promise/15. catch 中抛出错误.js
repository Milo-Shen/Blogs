let f = function () {
    return new Promise(resolve => {
        resolve(x / 2);
    });
};

f().catch(err => {
    // 输出: x is not defined
    console.log(err);
    y + 2;
}).catch(e => {
    // 输出: y is not defined
    console.log(e)
});