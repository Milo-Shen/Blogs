// 包装 next 函数，使其第一次加载时也能 next 传值
function wrapper(generator) {
    return function (...args) {
        let genObj = generator(...args);
        genObj.next();
        return genObj;
    };
}

let wrapped = wrapper(function* () {
    console.log(`input: ${yield}`);
});

// 再次包装一次，故而调用 wrapped()
wrapped().next('hello');