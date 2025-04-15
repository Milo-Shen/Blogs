function* generator() {
    console.log('generator');
}

let it = generator();

// 输出 true
console.log(it[Symbol.iterator]() === it);

