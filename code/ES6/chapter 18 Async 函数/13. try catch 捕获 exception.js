async function fn() {
    try {
        await new Promise(() => {
            throw new Error('error')
        })
    }
    catch (e) {
        console.log(e)
    }

    return await 'Hello'
}

// 输出：Hello
fn().then(v => console.log(v));