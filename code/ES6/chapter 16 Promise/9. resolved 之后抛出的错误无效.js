let promise = new Promise((resolve) => {
    resolve('ok');
    // 此时抛出异常等于没有抛出
    throw new Error('test');
});

promise.then(succ => console.log(succ))
       .catch(err => console.log(err));