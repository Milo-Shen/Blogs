let str = '123';

// 检查是否存在 Symbol.iterator 方法
console.log(typeof str[Symbol.iterator]);

let iterator = str[Symbol.iterator]();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());