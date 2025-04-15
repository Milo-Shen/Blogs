let thenable = {
    then: function(resolve) {
        console.log('enter !');
        resolve('Hello World');
    }
};

// 执行此句时输出 'enter !'
// 证明 Promise.resolve 在转化 thenable 对象过程中会自动调用该 thenable 的 then 方法
let p1 = Promise.resolve(thenable);

p1.then(function(value) {
    // 输出：Hello World
    console.log(value);
});