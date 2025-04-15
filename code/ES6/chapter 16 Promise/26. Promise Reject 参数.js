let thenable = {
    then(resolve, reject) {
        reject('error');
    }
};

Promise.reject(thenable)
    .catch(e => {
        // 输出：true
        console.log(e === thenable)
    })