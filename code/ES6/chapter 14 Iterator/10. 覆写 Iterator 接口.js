let str = new String("hello");

str[Symbol.iterator] = function () {
    return {
        next() {
            if (this.first) {
                this.first = false;
                return {value: 'bye', done: false}
            } else return {value: undefined, done: true}
        },
        first: true
    }
};

console.log([...str]);
console.log(str);