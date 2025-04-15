Promise.resolve().catch(function () {
    // 此句不执行
    console.log('error')
}).then(() => {
    // 输出 continue
    console.log('continue')
});