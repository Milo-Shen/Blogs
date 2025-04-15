let getJSON = url => {
    return new Promise(function (resolve, reject) {
        let client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = handler;
        client.responseType = 'json';
        client.setRequestHeader('Accept', 'application/json');
        client.send();

        function handler() {
            if (this.readyState !== 4) return;
            if (this.status === 200) resolve(this.response);
            else reject(new Error(this.statusText));
        }
    });
};

// 简写
getJSON('/api/test.json').then(
    post => getJSON(post.commentURL)
).then(
    comment => console.log(comment),
    err => console.log(err)
);

// 最初写法
getJSON('/api/test.json').then(function (post) {
    return getJSON(post.commentURL);
}).then(
    function (comments) {
        console.log(comments)
    },
    function (err) {
        console.log(err)
    }
);