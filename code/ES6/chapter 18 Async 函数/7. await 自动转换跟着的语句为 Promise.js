async function fn() {
    return await 123;
}

fn().then(v => console.log(v));
