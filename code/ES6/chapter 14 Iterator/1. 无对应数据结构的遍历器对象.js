// 累加器（ 无对应数据结构的遍历器对象 ）
let accumulator = array => {
    let index = 0;
    return {
        next: function () {
            return {value: index++, done: false}
        }
    }
};

// 获取遍历器指针
let it = accumulator();

console.log(it.next());
console.log(it.next());
console.log(it.next());
