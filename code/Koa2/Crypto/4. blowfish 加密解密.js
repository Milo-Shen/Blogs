const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString();

let cipher = crypto.createCipher('blowfish', key);

cipher.update('hello world', 'utf8', 'hex');
cipher.update('hello world', 'ascii', 'hex');
cipher.update(new Buffer(4), 'binary', 'hex');

console.log(cipher.final('hex'));