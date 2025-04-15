function Obj(value) {
    this.value = value;
    this.next = null;
}

Obj.prototype[Symbol.iterator] = function () {
    let current = this;

    let iterator = {
        next: next
    };

    function next() {
        if (current) {
            let value = current.value;
            let done = current == null;
            current = current.next;
            return {
                done: done,
                value: value
            }
        } else return {done: true};
    }

    return iterator;
};

let one = new Obj(1);
let two = new Obj(2);
let three = new Obj(3);

one.next = two;
two.next = three;

for (let i of one) {
    console.log(i)
}
