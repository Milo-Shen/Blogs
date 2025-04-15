// 获取 fetch
const fetch = require('node-fetch');

// api 地址
let books = [
    'https://api.douban.com/v2/book/1220560',
    'https://api.douban.com/v2/book/1220561',
    'https://api.douban.com/v2/book/1220562'
];

// 继发执行异步
async function sequence() {
    for (let book of books) {
        let response = await fetch(book).then(v => v.json());
        console.log(response)
    }
}

 sequence();

// 并发执行异步
async function asyncFn() {
    let [v1, v2, v3] = await Promise.all(books.map(url => fetch(url).then(v => v.json())));
    console.log(v1, v2, v3);
}

asyncFn();