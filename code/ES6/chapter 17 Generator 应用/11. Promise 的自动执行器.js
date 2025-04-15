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

// 自动执行器
function run(gen) {
    let g = gen();

    function next(data) {
        let result = g.next(data);
        if (result.done) return result.value;
        result.value.then(function (data) {
            next(data);
        })
    }

    next();
}

// 输出：A, B, C
run(gen);