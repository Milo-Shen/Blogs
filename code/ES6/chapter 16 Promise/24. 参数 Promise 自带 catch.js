const p1 = new Promise((resolve) => {
    resolve('hello');
});

const p2 = new Promise(() => {
    throw new Error('报错了');
});

// 输出：["hello", Error: 报错了]
Promise.all([p1, p2])
    .then(result => console.log(result))
    .catch(e => console.log(`外部捕获: ${e}`));