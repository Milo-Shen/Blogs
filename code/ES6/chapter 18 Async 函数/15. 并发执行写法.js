function f1() {
    return new Promise(resolve => setTimeout(resolve, 100, 'Hello'));
}

function f2() {
    return new Promise(resolve => setTimeout(resolve, 200, 'World'));
}

function f3() {
    return new Promise(resolve => setTimeout(resolve, 300, '!'));
}

// 原始写法
async function fn1() {
    let start = new Date();
    let v1 = await f1();
    let v2 = await f2();
    let v3 = await f3();
    let end = new Date();
    console.log(`fn1 输出：${v1} ${v2} ${v3}, 耗时：${end - start}`);
}

// 写法一
async function fn2() {
    let start = new Date();
    let [v1, v2, v3] = await Promise.all([f1(), f2(), f3()]);
    let end = new Date();
    console.log(`fn2 输出：${v1} ${v2} ${v3}, 耗时：${end - start}`);
}

fn1();

fn2();

