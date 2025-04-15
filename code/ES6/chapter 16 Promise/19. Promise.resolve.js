let jqueryPromise = Promise.resolve($.ajax('/api/book'));
let p1 = Promise.resolve('hello');
let p2 = new Promise(resolve => 'hello');