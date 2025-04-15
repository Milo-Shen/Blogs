async function fn() {
    return x / 2;
}

fn().then(
    v => console.log(v)
).catch(e => console.log(e));