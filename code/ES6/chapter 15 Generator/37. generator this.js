function* g() {
    this.name = 'jack';
}


g.prototype.hello = function () {
    console.log('hello');
};

let obj = g();

console.log(obj instanceof g);
console.log(obj.name);
