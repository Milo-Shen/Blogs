const crypto = require('crypto');

// 存在碰撞问题
const md5 = crypto.createHash('md5');
md5.update('hello world');

// 输出 : 5eb63bbbe01eeed093cb22bb8f5acdc3
console.log(md5.digest('hex'));

// 调用 digest 方法后，hash 对象被清空
// 无法再次调用 update 方法
md5.update('hello world');