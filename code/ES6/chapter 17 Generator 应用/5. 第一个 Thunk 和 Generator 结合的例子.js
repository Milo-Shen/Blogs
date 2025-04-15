let fs = require('fs');
let thunkify = require('thunkify');
let readFileThunk = thunkify(fs.readFile);

let gen = function* (){
    let r1 = yield readFileThunk('/etc/a.txt');
    console.log(r1.toString());
    let r2 = yield readFileThunk('/etc/b.txt');
    console.log(r2.toString());
};

let g = gen();

let r1 = g.next();
r1.value(function (err, data) {
    if (err) throw err;
    let r2 = g.next(data);
    r2.value(function (err, data) {
        if (err) throw err;
        g.next(data);
    });
});