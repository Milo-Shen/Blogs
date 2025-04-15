async function fn() {
    await new Promise((resolve, reject) => setTimeout(reject, 50, 'error 1')).catch(e => console.log(e));
    return await new Promise(resolve => setTimeout(resolve, 50, 'Hello !'))
}

fn().then(
    v => console.log(v),
);
