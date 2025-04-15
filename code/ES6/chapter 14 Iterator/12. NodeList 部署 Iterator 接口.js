NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];
[...document.getElementById('id')];

Array.prototype.slice.call(document.getElementById('id'))