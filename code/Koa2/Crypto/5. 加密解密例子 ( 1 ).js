const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString();

// 需要加密的文本
let plainText = 'Hello World';
console.log(`原始文本: ${plainText}`);

// 对文本进行加密
let cipher = crypto.createCipher('aes-256-cbc', key);
let crypted = cipher.update(plainText, 'utf8', 'hex');
crypted += cipher.final('hex');
console.log(`加密后文本: ${crypted}`);

// 对文本进行解密
let decipher = crypto.createDecipher('aes-256-cbc', key);
let dec = decipher.update(crypted, 'hex', 'utf8');
dec += decipher.final('utf8');

console.log(`解密后文本: ${dec}`);