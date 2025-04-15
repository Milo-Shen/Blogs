function* gen() {
    yield 1;
    yield 2;
    yield 3;
}

let g = gen();
let res = g.next();

while(!res.done){
    console.log(res.value);
    res = g.next();
}