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

// 使用 Co 处理并发的异步操作

// 数组的写法
co(function* () {
    let result = yield [
        readFile('./txt/A.txt'),
        readFile('./txt/B.txt'),
        readFile('./txt/C.txt')
    ];
    // 输出：A, B, C
    console.log(`${result[0]} ${result[1]} ${result[2]}`);
}).catch(e => console.log(e));

// 对象的写法
co(function* () {
    let result = yield {
        0: readFile('./txt/A.txt'),
        1: readFile('./txt/B.txt'),
        2: readFile('./txt/C.txt'),
    };
    // 输出：A, B, C
    console.log(`${result[0]} ${result[1]} ${result[2]}`);
}).catch(e => console.log(e));