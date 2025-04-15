let p1 = new Promise(resolve => {
    setTimeout(resolve, 1000, 'p1')
});

let p2 = new Promise(resolve => {
    setTimeout(resolve, 2000, 'p2')
});

setTimeout(function () {
    let start = new Date();
    Promise.all([p1, p2]).then(
        success => {
            let end = new Date();
            console.log(end - start);
            console.log(success)
        },
        error => console.log(error)
    );
}, 4000);