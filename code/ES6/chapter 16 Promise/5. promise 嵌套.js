let p1 = new Promise((resolve, reject) => {
    setTimeout(() => reject('fail'), 3000);
});

let p2 = new Promise((resolve, reject) => {
    setTimeout(() => resolve(p1), 1000);
});

p2.then(
    result => console.log(result),
    error => console.log(error)
);