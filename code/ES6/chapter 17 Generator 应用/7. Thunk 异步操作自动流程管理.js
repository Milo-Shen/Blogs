let fs = require('fs');

// 部署 Thunk 转换代码
let Thunk = function (fn) {
    return function (...args) {
        return function (callback) {
            return fn.call(this, ...args, callback);
        }
    };
};

// 部署 Thunk 版 readFile 函数
let readFile = Thunk(fs.readFile);

// Thunk 结合 Generator 进行异步处理
let g = function* () {
    let f1 = yield readFile('./txt/A.txt');
    let f2 = yield readFile('./txt/B.txt');
    let f3 = yield readFile('./txt/C.txt');
    console.log(`${f1}, ${f2}, ${f3}`);
};

// 自动执行器 run
function run(fn) {
    let gen = fn();

    function next(err, data) {
        let result = gen.next(data);
        if (result.done) return;
        result.value(next);
    }

    next();
}

// 执行自动执行器
run(g);