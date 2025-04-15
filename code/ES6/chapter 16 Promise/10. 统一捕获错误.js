getJSON('/api/test.json').then(function (post) {
    return getJSON(post.commentURL);
}).then(
    function (comments) {
        console.log(comments)
    }
).catch(err => {
    // 此处处理前面三个 promise 产生的错误
});
