let arr = [1, 2, 3];

// 自己实现数组的迭代器接口
arr[Symbol.iterator] = function () {
    let position = 0,
        _this = this,
        length = this.length;

    return {
        // 定义 next 方法
        next() {
            if (position < length) return {value: _this[position++], done: false};
            else return {value: undefined, done: true}
        },
        // 定义 return 方法，此方法会自动在 for ... of 循环 break 或是 continue 时候执行
        return() {
            console.log('break the loop!');
            return {value: undefined, done: true}
        }
    }
};

for (let i of arr) {
    console.log(i);
    // 迭代一次，即 break ，此时控制台会打印 break the loop! 代表结束了循环
    break;
}