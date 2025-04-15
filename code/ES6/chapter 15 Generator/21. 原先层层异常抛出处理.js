// 回调地狱
ajax('a', function (a) {
    if (a.error) throw new Error(a.error);
    ajax('b', function (b) {
        if (b.error) throw new Error(b.error);
        ajax('c', function (c) {
            if (c.error) throw new Error(c.error);
        })
    })
});

// 用途
function* g() {
    try {
        let a = yield ajax('a');
        let b = yield ajax('b');
        let c = yield ajax('c');
    } catch (e) {
        console.log(e);
    }
}