function* fibonacci() {
    let [pre, cur] = [0, 1];
    while (true) {
        [pre, cur] = [cur, pre + cur];
        yield cur;
    }
}

for (let i of fibonacci()) {
    if (i > 1000) break;
    console.log(i);
}