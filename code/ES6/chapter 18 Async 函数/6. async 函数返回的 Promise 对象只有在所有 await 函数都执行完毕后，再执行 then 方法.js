async function fn() {
    let f1 = await new Promise(resolve => setTimeout(resolve, 100, 'Hello'));
    let f2 = await new Promise(resolve => setTimeout(resolve, 200, 'World'));
    let f3 = await new Promise(resolve => setTimeout(resolve, 300, '!'));
    return `${f1} ${f2} ${f3}`
}

fn().then(
    // 输出：Hello World !
    v => console.log(v),
    e => console.log(e)
);