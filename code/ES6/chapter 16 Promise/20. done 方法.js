Promise.prototype.done = function (onFulFilled, onRejected) {
    this.then(onFulFilled, onRejected).catch(function (reason) {
        setTimeout(()=>{throw reason}, 0)
    })
};

// 参开用法
asyncFunc().then().done();