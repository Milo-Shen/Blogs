async function fn() {
    await new Promise((resolve, reject) => {
        throw new Error('error !');
    })
}

// reject 回调捕获异常
fn().then(
    v => console.log(v),
    e => console.log(e)
);

// catch 捕捉异常
fn().then(
    v => console.log(v)
).catch(e => console.log(e));