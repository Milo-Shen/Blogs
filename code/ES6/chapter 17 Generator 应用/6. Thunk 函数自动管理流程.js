function run(fn) {
    let gen = fn();

    function next(err, data) {
        let result = gen.next(data);
        if (result.done) return;
        result.value(next);
    }

    next();
}

function* gen() {
    yield 1;
    yield 2;
    yield 3;
}

run(gen)