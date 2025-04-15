const fs = require('fs');

// 将 readFile 包装成 Promise 对象
let readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            if (err) reject(err);
            resolve(data);
        })
    });
};

// async 读取文件
let asyncReadFile = async function () {
    let f1 = await readFile('./txt/A.txt');
    let f2 = await readFile('./txt/B.txt');
    let f3 = await readFile('./txt/C.txt');
    console.log(`${f1} ${f2} ${f3}`);
};

asyncReadFile();