function* iterTree(tree) {
    if (Array.isArray(tree)) {
        for (let i = 0; i < tree.length; i++) {
            yield* iterTree(tree[i]);
        }
    } else yield tree;
}

let tree = ['a', ['b', 'c'], [['d'], ['e']]];

for (let v of iterTree(tree)) {
    console.log(v)
}