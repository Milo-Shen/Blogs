const MD5 = require('md5.js');

let count = 1;

let current = new Date();

while (true) {
    let md5 = new MD5().update(count.toString()).digest('hex');
    count++;
    let now = new Date();
    if (now - current > 10000) {
        console.log(`进行了： ${count} 次`);
        break
    }
}