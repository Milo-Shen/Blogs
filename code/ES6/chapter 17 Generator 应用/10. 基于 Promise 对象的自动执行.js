let fs = require('fs');

// 将 readFile 包装成 Promise 对象
let readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
};

// 此处的 readFile 是 Promise 函数
let gen = function* () {
    let f1 = yield readFile('./txt/A.txt');
    let f2 = yield readFile('./txt/B.txt');
    let f3 = yield readFile('./txt/C.txt');
    console.log(`${f1}, ${f2}, ${f3}`);
};

// 手动执行 Generator 函数
let g = gen();
g.next().value.then(function (data) {
    g.next(data).value.then(function (data) {
        g.next(data).value.then(function (data) {
            g.next(data);
        })
    })
});