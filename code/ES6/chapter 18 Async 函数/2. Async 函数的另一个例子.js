async function timeout(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function Print(value, ms) {
    await timeout(ms);
    console.log(value)
}

// 500ms 后将输出字符串 'Hello'
Print('Hello', 500);