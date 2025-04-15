let arr = [1, [2, [3, 4]], 5];

// 递归定义 Generator 函数
let flat = function* (a) {
    let length = a.length;
    a.forEach(item => {
        if (typeof item !== 'number') yield* flat(item);
        else yield item;
    })
};

for (let i of flat(arr)) {
    console.log(i)
}