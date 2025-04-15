const co = require('co');
const fs = require('fs');

const stream = fs.createReadStream('./txt/book.txt');

co(function* () {
    while (true) {
        let result = yield Promise.race([
            new Promise(resolve => stream.once('data', resolve)),
            new Promise(resolve => stream.once('end', resolve)),
            new Promise((resolve, reject) => stream.once('error', reject))
        ]);
        console.log((result || '').toString());
        if (!result) break;
        stream.removeAllListeners('data');
        stream.removeAllListeners('end');
        stream.removeAllListeners('error');
    }
});