let fetch = require('node-fetch');

function* gen() {
    let url = 'https://api.gethub.com/users/github';
    let result = yield fetch(url);
    console.log(result);
}

let g = gen();
let result = g.next();

// 操作
result.value
    .then(data => data.json())
    .then(data => g.next(data));
