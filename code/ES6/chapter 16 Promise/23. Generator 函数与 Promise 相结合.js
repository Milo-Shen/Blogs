function getF() {
    return new Promise(function (resolve) {
        resolve('f');
    })
}

let g = function* () {
    try {
        let foo = yield getF();
        console.log(foo);
    } catch (e) {
        console.log(e)
    }
};

function run(generator) {
    let it = generator();

    function go(result) {
        if (result.done) return result.value;
        return result.value.then(function (value) {
            return go(it.next(value))
        }, function (error) {
            return go(it.throw(error))
        })
    }

    go(it.next());
}

run(g);