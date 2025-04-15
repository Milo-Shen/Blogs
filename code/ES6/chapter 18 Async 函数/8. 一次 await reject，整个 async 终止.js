async function fn() {
    await Promise.reject('出错了');
    await Promise.resolve('Hello World !');
}

// 输出：出错了
// await Promise.resolve('Hello World !') 此语句不执行
fn().then(
    v => console.log(v),
    e => console.log(e)
);