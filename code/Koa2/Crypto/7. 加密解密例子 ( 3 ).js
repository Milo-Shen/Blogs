const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString();

// 需要加密的文本
let plainText = 'Hello World';
console.log(`原始文本: ${plainText}`);

let crypted = '';

let cipher = crypto.createCipher('aes192', key);

cipher.on('readable', () => {
    const data = cipher.read();
    if (data) crypted += data.toString('hex');
});
cipher.on('end', () => {
    console.log(`加密后的文本: ${crypted}`);
});

cipher.write(plainText);
cipher.end();


// 对文本进行解密
let decipher = crypto.createDecipher('aes192', key);
let dec = decipher.update(crypted, 'hex', 'utf8');
dec += decipher.final('utf8');

console.log(`解密后文本: ${dec}`);