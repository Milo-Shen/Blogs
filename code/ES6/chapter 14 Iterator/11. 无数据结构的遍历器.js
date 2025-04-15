let idMaker = () => {
    let index = 0;
    return {
        next() {
            return {value: index++, done: false}
        }
    }
};

let it = idMaker();

console.log(it.next().value);
console.log(it.next().value);
console.log(it.next().value);