function* dataConsumer() {
    console.log('started');
    console.log(`1. ${yield 1}`);
    console.log(`2. ${yield 2}`);
    return 'result';
}

let it = dataConsumer();

// 此处需要特别分析其调用过程
it.next();
console.log(it.next('a'));
console.log(it.next('b'));
