let fs = require('fs');

fs.readFile(fileName, callback);

let Thunk = function (fileName) {
    return function (callback) {
        return fs.readFile(fileName, callback);
    }
};

let readFileThunk = Thunk(fileName);
readFileThunk(callback);