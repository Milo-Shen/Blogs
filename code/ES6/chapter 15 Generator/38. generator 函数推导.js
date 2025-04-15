let generator = function* () {
    for (let i = 0; i < 6; i++) {
        yield i;
    }
};

let squared = (for (n of generator()) n * n);