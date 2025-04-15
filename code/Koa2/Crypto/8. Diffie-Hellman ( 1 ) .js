const crypto = require('crypto');

// 第一个人的 key
let person1 = crypto.createDiffieHellman(512);
let person1_keys = person1.generateKeys('hex');

let prime = person1.getPrime();
let generator = person1.getGenerator();

console.log('Prime: ' + prime.toString('hex'));
console.log('Generator: ' + generator.toString('hex'));

// 第二个人的 key
let person2 = crypto.createDiffieHellman(prime, generator);
let person2_keys = person2.generateKeys('hex');

// 交换并生成密钥
let person1_secret = person1.computeSecret(person2_keys, 'hex', 'base64');
let person2_secret = person2.computeSecret(person1_keys, 'hex', 'base64');

// 打印密钥
console.log(`第一个人的 key: ${person1_secret}`);
console.log(`第二个人的 key: ${person2_secret}`);

// key 是否想等
console.log(`key 是否相同: ${person1_secret === person2_secret}`);