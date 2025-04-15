let p1 = new Promise(resolve => {
    setTimeout(resolve, 1000, 'p1')
});

let p2 = new Promise((resolve, reject) => {
    setTimeout(reject, 500, 'p2')
});

Promise.race([p1, p2]).then(
    success => console.log(success)
).catch(e => console.log(e));
