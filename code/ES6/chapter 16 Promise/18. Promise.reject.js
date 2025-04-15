// let p1 = Promise.reject('error');
let p2 = new Promise((resolve, reject) => {
    reject('foo');
});

p2.then(null, function (s) {
    console.log(s)
});