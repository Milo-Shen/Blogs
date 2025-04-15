---
title: nodejs 之 Crypto 加密模块
date: 2018-06-03 16:32:00
tags: nodejs
categories: nodejs
comments: true

---

前言 : nodejs 为我们提供了原生的 Crypto，加密模块，其主要利用 openssl 库来提供通用的加密和 hash 算法，nodejs 使用 C++ 实现这些算法后，通过该模块提供给我们调用，相比于 js 算法，执行效率大为提升。
<!--more-->

## Crypto 之 hash 算法
我们先来看看 hash 算法，我们可以通过 crypto.createHash 来创建一个 hash 实例。  
我们可以创建的 hash 类型有 md5, sha1, sha256 等。

### md5 加密

```
const crypto = require('crypto');

// 创建一个 md5 hash 实例
const md5 = crypto.createHash('md5');
// 输入想要加密的文本
md5.update('hello world');

// 以 16 进制形式打印 md5 值
// 输出 : 5eb63bbbe01eeed093cb22bb8f5acdc3
console.log(md5.digest('hex'));

// 调用 digest 方法后，hash 对象被清空
// 无法再次调用 update 方法，此处报错
md5.update('hello world');
```

这里需要注意的是，MD5 存在碰撞性，可以被暴力破解。除此之外，当进行 digest 方法后，之前创建的 hash 实例会被清空，故而无法再次 update。

### update 具有记忆功能

```
const crypto = require('crypto');

let one = crypto.createHash('md5');
one.update('hello');
one.update('world');

let two = crypto.createHash('md5');
two.update('helloworld');

// 分步 update 效果和把字符串按顺序拼接打包 update 产生的结果相同
console.log(one.digest('hex') === two.digest('hex'));
```

多次 update 等于是把字符串相加，然后在hash.digest()将字符串加密返回

### hmac 加密
hmac 是密钥相关的哈希运算消息认证码。即使用一个密钥和一段待加密文本，通过 hash 算法，生成密文的加密方式。该加密方式使用 `crypto.createHmac(algorithm, key)` 函数，使用方式和上文 md5 一致，下面我们看一个 hmac 加密的例子

首先我们使用 `openssl genrsa  -out server.pem 1024` 命令创建一个 key1.pem 文件作为密钥，然后执行 hmac 加密操作

```
const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString('ascii');

// 使用密钥加密密文
let hmac = crypto.createHmac('sha1', key);
// 输入需要加密的内容
hmac.update('hello world');

// 转换成 16 进制，输出密文
console.log(hmac.digest('hex'));
```

除了需要一个密钥证书之外，其余操作和 createHash 一致

## Public Key Cryptography 公开密钥解密解密
Crypto 模块提供的公开密钥加密包含 Cipher, Decipher, Sign, Verify 四个类。我们着重说明一下 Cipher 和 Decipher 这两个常用的加密解密方法。

### 用到的函数
1. crypto.createCipher(algorithm, password)
2. crypto.createCipheriv(algorithm, key, iv)
3. cipher.update(data, [input_encoding], [output_encoding])

+ algorithm 表示加密算法 （ 可以使用 `openssl list-cipher-algorithms` 查看系统支持的加密算法 ）
+ password 表示用来加密的密钥，也可以用于派生 key 和 iv
+ update 方法中，input_encoding 表示传入的数据格式 ( 'utf8', 'ascii', 'binary' )，默认是 binary
+ output_encoding 表示返回 block 的数据格式

### 第一个 Cipher 例子 ( aes-256-cbc 加密方式)

```
const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString();

// 需要加密的文本
let plainText = 'Hello World';
console.log(`原始文本: ${plainText}`);

// 配合密钥 pem，使用 aes-256-cbc 算法加密
let cipher = crypto.createCipher('aes-256-cbc', key);
// 对 plainText 文本进行加密，输入格式 utf8，输出 hex 16进制格式
let crypted = cipher.update(plainText, 'utf8', 'hex');
crypted += cipher.final('hex');
// 输出加密后文本
console.log(`加密后文本: ${crypted}`);

// 配合密钥 pem，使用 aes-256-cbc 算法解密
let decipher = crypto.createDecipher('aes-256-cbc', key);
// 对解密后文本，按照相同的算法和密钥进行解密
let dec = decipher.update(crypted, 'hex', 'utf8');
dec += decipher.final('utf8');
// 输出解密后文本
console.log(`解密后文本: ${dec}`);
```

程序输出信息：  
PS：加密后文本随着 key.pem 的不同也会输出不同的值，这里是笔者使用密钥加密后结果

```
原始文本: Hello World
加密后文本: 141d14c35a7f0a4e6a0eb9c7ed757e59
解密后文本: Hello World
```

### Cipher ( aes192 ) 方式加密 （非事件监听方式）

```
const crypto = require('crypto');
const fs = require('fs');

// 读取密钥
let pem = fs.readFileSync('key1.pem');
let key = pem.toString();

// 需要加密的文本
let plainText = 'Hello World';
console.log(`原始文本: ${plainText}`);

// 对文本进行加密
let cipher = crypto.createCipher('aes192', key);
let crypted = cipher.update(plainText, 'utf8', 'hex');
crypted += cipher.final('hex');
console.log(`加密后文本: ${crypted}`);

// 对文本进行解密
let decipher = crypto.createDecipher('aes192', key);
let dec = decipher.update(crypted, 'hex', 'utf8');
dec += decipher.final('utf8');

console.log(`解密后文本: ${dec}`);
```

输出结果：

```
原始文本: Hello World
加密后文本: 4df8aad7a959d228ef2081e48a768745
解密后文本: Hello World
```

### Cipher ( aes192 ) 方式加密 （事件监听方式）

```
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

//监听 readable 事件，拿到加密后的密文
cipher.on('readable', () => {
    const data = cipher.read();
    if (data) crypted += data.toString('hex');
});
cipher.on('end', () => {
    // 输出加密后的密文，此处可对密文做进一步处理
    console.log(`加密后的文本: ${crypted}`);
});

// 输入需要加密的文本
cipher.write(plainText);
cipher.end();


// 对文本进行解密
let decipher = crypto.createDecipher('aes192', key);
let dec = decipher.update(crypted, 'hex', 'utf8');
dec += decipher.final('utf8');

console.log(`解密后文本: ${dec}`);
```

执行结果：

```
原始文本: Hello World
解密后文本: Hello World
加密后的文本: 4df8aad7a959d228ef2081e48a768745
```

### 对该公开密钥加密解密过程进行封装

```
const crypto = require('crypto');
const fs = require('fs');

// 对加密过程进行封装
function encrypt(data, key, method = 'aes192') {
    const cipher = crypto.createCipher(method, key);
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

// 对解密过程进行封装
function decrypt(encrypted, key, method = 'aes192') {
    const decipher = crypto.createDecipher(method, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// 对上述封装的验证，首先确定原始待加密文本
let data = '这是一条加密信息!';
// 读取密钥，用于加密操作用
let key = fs.readFileSync('key1.pem');
// 对文本进行加密，算法为 : aes192
let encrypted = encrypt(data, key, 'aes192');
// 对文本进行解密，算法为 : aes192
let decrypted = decrypt(encrypted, key, 'aes192');

console.log('原始文本: ' + data);
console.log('加密文本: ' + encrypted);
console.log('解密文本: ' + decrypted);
```

执行结果：

```
原始文本: 这是一条加密信息!
加密文本: a63a8e870834f3ea197103392640bbff3f25086ae0cc84ce54f5bd7a8288b8a2
解密文本: 这是一条加密信息!
```

## Diffie-Hellman 密钥交换协议/算法

我们可以使用该算法，确定一个对称密钥，再用该密钥进行加密解密操作。需要注意的是 Diffie-Hellman 算法不能用于加密传输密文，只能用于确立一个公共密钥，双方确定要用的密钥后，要使用其他对称密钥操作加密算法实际加密和解密消息。

### 需要用到的函数

+ diffieHellman.getPrime([encoding]) 获得 dh 算法生成的素数 (encoding 为编码格式,可选 binary (默认), hex , base64)
+ diffieHellman.getGenerator([encoding]) 同上
+ diffieHellman.generateKeys([encoding]) 按照指定编码格式生成 私有/公有 key，返回值是公有 key，公有key会传递给另外一方，用来生成对称密钥用
+ diffieHellman.getPrivateKey([encoding]) 生成私有密钥
+ diffieHellman.getPublicKey([encoding]) 生成公有密钥
+ diffieHellman.setPublicKey(public_key, [encoding]) 以指定的编码格式设置公有 key
+ diffieHellman.setPrivateKey(public_key, [encoding]) 以指定的编码格式设置私有 key
+ diffieHellman.computeSecret(other_public_key, [input_encoding], [output_encoding]) 根据 对方的公有 key 算出对称密钥, input_encoding 是对方密钥输入的编码格式，output_encoding 是对称密钥输出的格式
+ crypto.getDiffieHellman(group_name) 生成一个预定义的dh交换key对象 （支持 modp1, modp2, modp5 等，其优点是不用交换生成key，只需要在握手前使用一样的group系数即可，节约了大家的处理时间和握手时间）

```
const crypto = require("crypto");

// 第一个人的 key
let person1 = crypto.createDiffieHellman(512, 'base64');
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
```

执行结果：

```
Prime: ba226abde807d86cf1f632fa1563599d5695ba32cd338acc62680cd29f6905b348d6d9b36bd3b8cc00926a5155a36592398de4fe97259e9fc80f3f651025f56b
Generator: 02
第一个人的 key: ORuR1bvIqMCb2usK8gYPgCqvbs7Fyz9xj0z+gQ9SNAuIVPnwiKAAuEhu5HpvUkbmwfwmDpXH3Q/ciAyezGkB0Q==
第二个人的 key: ORuR1bvIqMCb2usK8gYPgCqvbs7Fyz9xj0z+gQ9SNAuIVPnwiKAAuEhu5HpvUkbmwfwmDpXH3Q/ciAyezGkB0Q==
key 是否相同: true
```

上述例子，我们使用 DF 算法生成了 2个密钥 key，可以看到，在交换素数以后，person1 和 person 2 生成的密钥是相同的，我们就可以使用这个密钥配合其他加密算法，去传输密文了！