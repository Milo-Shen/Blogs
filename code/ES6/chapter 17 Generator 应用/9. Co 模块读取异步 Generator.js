let fs = require('fs');
let co = require('co');

// 将 readFile 包装成 Promise 对象
let readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
};

// Thunk 结合 Generator 进行异步处理
let g = function* () {
    let f1 = yield readFile('./txt/A.txt');
    let f2 = yield readFile('./txt/B.txt');
    let f3 = yield readFile('./txt/C.txt');
    console.log(`${f1}, ${f2}, ${f3}`);
};

// 执行自动执行器
co(g);