const crypto = require('crypto');
const fs = require('fs');

function encrypt(data, key, method = 'aes192') {
    const cipher = crypto.createCipher(method, key);
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(encrypted, key, method = 'aes192') {
    const decipher = crypto.createDecipher(method, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

let data = '这是一条加密信息!';
let key = fs.readFileSync('key1.pem');
let encrypted = encrypt(data, key, 'aes192');
let decrypted = decrypt(encrypted, key, 'aes192');

console.log('原始文本: ' + data);
console.log('加密文本: ' + encrypted);
console.log('解密文本: ' + decrypted);