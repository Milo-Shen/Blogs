const crypto = require('crypto');

let one = crypto.createHash('md5');
one.update('hello');
one.update('world');

let two = crypto.createHash('md5');
two.update('helloworld');

// 分步 update 效果和把字符串按顺序拼接打包 update 产生的结果相同
console.log(one.digest('hex') === two.digest('hex'));

