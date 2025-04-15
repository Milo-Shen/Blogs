function* f() {
    yield 'a';
    yield 'b';
}

function* Y() {
    yield 'c';
    f()
    yield 'd';
}

for(let v of Y()){
    console.log(v);
}