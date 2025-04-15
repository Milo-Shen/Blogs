// let promise = new Promise(function (resolve, reject) {
//     throw new Error('test');
// });
//
// promise.catch(err => console.log('err occur'));


let promise = new Promise(function (resolve, reject) {
    reject(new Error('error'));
});

promise.catch(err => console.log(err));
