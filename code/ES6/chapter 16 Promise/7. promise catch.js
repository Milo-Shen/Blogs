// 原始写法
getJSON('/api/test.json').then(
    // success, resolve
).catch(err => {
    // 处理前一个回调函数返回的错误
});

// 等价写法
getJSON('/api/test.json').then(
    // success, resolve
).then(null, err => {
    // 处理前一个回调函数返回的错误
});