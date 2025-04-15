const fetch = require('node-fetch');
const max_repeat = 3;

async function test() {
    let i = 0;
    for (i = 0; i < max_repeat; i++) {
        try {
            await fetch('http://www.baidu.com');
            break;
        } catch (e) {
            console.log(e)
        }
    }
    console.log(i);
}

test();