function fn() {
    try {
        new Promise((resolve, reject) => setTimeout(reject, 50, 'error 1'))
    } catch (e) {
        console.log(e);
    }
}

fn();