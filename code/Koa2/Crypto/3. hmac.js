const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString();

// 使用密钥加密密文
let hmac = crypto.createHmac('sha1', key);
// 输入需要加密的内容
hmac.update('hello world');

// 转换成 16 进制，输出密文
console.log(hmac.digest('hex'));