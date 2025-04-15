// 在 [Symbol.iterator] 上部署遍历器生成方法
class RangeIterator {
    constructor(start, end) {
        this.value = start;
        this.stop = end;
    }

    [Symbol.iterator]() {
        return this
    };

    next() {
        if (this.value < this.stop) {
            this.value++;
            return {done: false, value: this.value}
        } else return {done: true, value: undefined}
    }
}

// 在对象上使用 for of
function range(start, end) {
    return new RangeIterator(start, end);
}

for (let value of range(0, 3)) {
    console.log(value)
}